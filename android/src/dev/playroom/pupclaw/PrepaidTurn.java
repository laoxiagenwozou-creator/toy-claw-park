package dev.playroom.pupclaw;

import android.util.AtomicFile;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

// The app's coin slot. The family database still owns the PIN and the parent's
// settings. A new allowance revision is accepted only after those settings commit.
final class PrepaidTurn {
    private static final Object lock = new Object();
    private final AtomicFile file;

    PrepaidTurn(File directory) { file = new AtomicFile(new File(directory, "prepaid-claw-turn")); }

    private static final class Slot {
        int serial, revision = -1, coins;
        boolean limited;
        String result(boolean applied) {
            return "[" + revision + "," + coins + "," + limited + "," + serial + "," + applied + "]";
        }
        void validate() throws IOException {
            if (serial == Integer.MIN_VALUE || revision < 0 || coins < 0 || coins > 999
                    || (!limited && coins != 0) || (serial > 0 && (!limited || coins == 0)))
                throw new IOException("Invalid coin slot");
        }
    }

    private Slot read() throws IOException {
        Slot slot = new Slot();
        FileInputStream input;
        try { input = file.openRead(); }
        catch (FileNotFoundException missing) {
            if (file.getBaseFile().exists() || new File(file.getBaseFile().getPath()+".bak").exists()) throw missing;
            return slot;
        }
        try (DataInputStream data = new DataInputStream(input)) {
            slot.serial = data.readInt();
            if (slot.serial == Integer.MIN_VALUE) throw new IOException("Invalid serial");
            int format = data.read();
            if (format == -1) return slot; // 2.9.2 recorded only the signed serial.
            if (format != 1) throw new IOException("Unknown coin slot format");
            slot.revision = data.readInt(); slot.coins = data.readInt(); slot.limited = data.readBoolean();
            slot.validate();
            if (data.read() != -1) throw new IOException("Unexpected coin slot data");
            return slot;
        }
    }

    private void write(Slot slot) throws IOException {
        slot.validate();
        FileOutputStream output = file.startWrite();
        try {
            DataOutputStream data = new DataOutputStream(output);
            data.writeInt(slot.serial); data.writeByte(1); data.writeInt(slot.revision);
            data.writeInt(slot.coins); data.writeBoolean(slot.limited);
            output.getFD().sync(); file.finishWrite(output);
        } catch (IOException error) { file.failWrite(output); throw error; }
        Slot saved = read();
        if (!saved.result(false).equals(slot.result(false))) throw new IOException("Coin slot save failed");
    }

    String current() {
        synchronized (lock) {
            try { return read().result(false); } catch (IOException error) { return null; }
        }
    }

    String configure(int revision, int coins, boolean limited, boolean inserted, int savedSerial) {
        synchronized (lock) {
            try {
                Slot slot = read();
                if (revision <= slot.revision || revision < 0) return slot.result(false);
                int previous = slot.serial, newest = Math.max(Math.abs(previous), savedSerial);
                if (slot.revision == -1 && inserted && savedSerial > 0
                        && (previous == -savedSerial || Math.abs(previous) > savedSerial)) {
                    // 2.9.2 redeemed this turn while the family database was still busy.
                    inserted = false; coins--;
                }
                if (inserted && savedSerial == 0) newest = Math.incrementExact(newest);
                slot.serial = inserted ? newest : -newest;
                slot.revision = revision; slot.coins = coins; slot.limited = limited;
                write(slot); return slot.result(true);
            } catch (IOException | ArithmeticException error) { return null; }
        }
    }

    String insert(int revision) {
        synchronized (lock) {
            try {
                Slot slot = read();
                if (slot.revision != revision || !slot.limited || slot.coins < 1 || slot.serial > 0)
                    return slot.result(false);
                slot.serial = Math.incrementExact(Math.abs(slot.serial));
                write(slot); return slot.result(true);
            } catch (IOException | ArithmeticException error) { return null; }
        }
    }

    String take(int revision, int serial) {
        synchronized (lock) {
            try {
                Slot slot = read();
                if (slot.revision != revision || revision < 0) return slot.result(false);
                if (!slot.limited) return slot.result(true);
                if (serial <= 0 || slot.serial != serial || slot.coins < 1) return slot.result(false);
                slot.serial = -serial; slot.coins--;
                write(slot); return slot.result(true);
            } catch (IOException error) { return null; }
        }
    }
}
