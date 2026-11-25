package dev.playroom.pupclaw;

import android.Manifest;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.Display;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final int CAMERA_PERMISSION = 41;
    private static final int PARENT_CONFIRM = 42;
    private int parentRequest;
    private static final String LOCAL_ORIGIN = "https://pupclaw.invalid/";
    private WebView web;
    private PrepaidTurn prepaidTurn;
    private FaceCamera faceCamera;
    private boolean cameraWanted;
    private boolean requestingPermission;
    private boolean resumed;
    private boolean gameActive;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setVolumeControlStream(android.media.AudioManager.STREAM_MUSIC);
        enterFullscreen();

        prepaidTurn = new PrepaidTurn(getFilesDir());
        web = new WebView(this);
        web.setBackgroundColor(0xfffff4dd);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBlockNetworkLoads(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setTextZoom(100);
        web.setWebViewClient(new ParkAssets(this, LOCAL_ORIGIN));
        web.addJavascriptInterface(new GameBridge(), "BudNative");
        setContentView(web);
        web.loadUrl(LOCAL_ORIGIN);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterFullscreen();
    }

    private void enterFullscreen() {
        Window window = getWindow();
        View decor = window.getDecorView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
            // On startup the view may not be attached yet. Window focus retries this.
            WindowInsetsController controller = decor.getWindowInsetsController();
            if (controller != null) {
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                controller.hide(WindowInsets.Type.systemBars());
            }
        } else {
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        resumed = true;
        if (web != null) {
            web.onResume();
            web.evaluateJavascript("window.BudSound?.setForeground(true)", null);
        }
        updateRefreshRate();
        openRequestedCamera();
    }

    @Override
    protected void onPause() {
        resumed = false;
        updateRefreshRate();
        closeCamera();
        if (web != null) {
            web.evaluateJavascript("window.BudSound?.setForeground(false)", null);
            web.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        closeCamera();
        if (web != null) {
            web.removeJavascriptInterface("BudNative");
            ((android.view.ViewGroup) web.getParent()).removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    private void updateRefreshRate() {
        Display display = getWindowManager().getDefaultDisplay();
        float rate = 0f;
        if (resumed && gameActive) {
            Display.Mode current = display.getMode();
            for (Display.Mode mode : display.getSupportedModes()) {
                if (mode.getPhysicalWidth() == current.getPhysicalWidth()
                        && mode.getPhysicalHeight() == current.getPhysicalHeight()) {
                    rate = Math.max(rate, mode.getRefreshRate());
                }
            }
        }
        WindowManager.LayoutParams attributes = getWindow().getAttributes();
        if (Math.abs(attributes.preferredRefreshRate - rate) > 0.1f) {
            attributes.preferredRefreshRate = rate;
            getWindow().setAttributes(attributes);
        }
    }

    public final class GameBridge {
        @JavascriptInterface public String currentCoinSlot() { return prepaidTurn.current(); }
        @JavascriptInterface public String configureCoinSlot(int revision, int coins, boolean limited, boolean inserted, int serial) {
            return prepaidTurn.configure(revision, coins, limited, inserted, serial);
        }
        @JavascriptInterface public String insertClawCoin(int revision) { return prepaidTurn.insert(revision); }
        @JavascriptInterface public String takeClawCoin(int revision, int serial) { return prepaidTurn.take(revision, serial); }

        @JavascriptInterface
        public void confirmParent(int ticket) {
            runOnUiThread(() -> {
                if (web == null || ticket < 1) return;
                if (!resumed || parentRequest != 0) { parentResult(ticket, false); return; }
                KeyguardManager manager = getSystemService(KeyguardManager.class);
                Intent prompt = manager != null && manager.isDeviceSecure()
                        ? manager.createConfirmDeviceCredentialIntent("验证家长身份", "验证本机锁屏凭据后重设游戏 PIN") : null;
                if (prompt == null) { parentResult(ticket, false); return; }
                parentRequest = ticket;
                startActivityForResult(prompt, PARENT_CONFIRM);
            });
        }
        @JavascriptInterface
        public void setGameActive(boolean active) {
            runOnUiThread(() -> {
                if (isDestroyed()) return;
                gameActive = active;
                updateRefreshRate();
            });
        }

        @JavascriptInterface
        public void setCameraEnabled(boolean enabled) {
            runOnUiThread(() -> {
                if (isDestroyed()) return;
                cameraWanted = enabled;
                if (enabled) openRequestedCamera();
                else closeCamera();
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == PARENT_CONFIRM && parentRequest != 0) {
            int ticket = parentRequest; parentRequest = 0;
            parentResult(ticket, result == RESULT_OK);
        }
    }
    private void parentResult(int ticket, boolean confirmed) {
        if (web != null) web.evaluateJavascript("window.ParkParent?.confirmed(" + ticket + "," + confirmed + ")", null);
    }
    private void openRequestedCamera() {
        if (!cameraWanted || !resumed || requestingPermission || faceCamera != null) return;
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            requestingPermission = true;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION);
            return;
        }
        sendState("starting");
        faceCamera = new FaceCamera(this);
        faceCamera.open();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(code, permissions, grantResults);
        if (code != CAMERA_PERMISSION) return;
        requestingPermission = false;
        if (!cameraWanted) return;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            openRequestedCamera();
        } else {
            cameraWanted = false;
            sendState("denied");
        }
    }

    private void closeCamera() {
        if (faceCamera == null) return;
        FaceCamera old = faceCamera;
        faceCamera = null;
        old.close();
    }

    void cameraFailed(FaceCamera source) {
        if (faceCamera != source) return;
        cameraWanted = false;
        closeCamera();
        sendState("unavailable");
    }

    void faceFound(FaceCamera source, float x, float y, float span, int rotation, long capturedAt) {
        runOnUiThread(() -> {
            if (faceCamera != source || web == null || SystemClock.elapsedRealtime() - capturedAt > 180) return;
            String script = String.format(Locale.ROOT,
                    "window.BudCamera?.sample(%.5f,%.5f,%.5f,%d,%d)", x, y, span, rotation, capturedAt);
            web.evaluateJavascript(script, null);
        });
    }

    private void sendState(String event) {
        if (web != null) web.evaluateJavascript("window.BudCamera?.state('" + event + "')", null);
    }
}
