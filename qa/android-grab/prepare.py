"""Stage a disposable Android touch probe using the web assets from an already built APK."""
from pathlib import Path, PurePosixPath
import shutil
import sys
import zipfile

apk, target = map(Path, sys.argv[1:])
source = Path(__file__).resolve().parents[2]
target.mkdir(parents=True, exist_ok=False)
shutil.copytree(source / "android", target / "android")
shutil.copy2(source / "build-android.ps1", target / "build-android.ps1")

manifest = target / "android/AndroidManifest.xml"
text = manifest.read_text(encoding="utf-8")
old_id, test_id = "dev.playroom.pupclaw", "dev.playroom.pocketclawgrabqa"
if f'package="{old_id}"' not in text or 'android:name=".MainActivity"' not in text:
    raise ValueError("Unexpected production manifest")
text = text.replace(f'package="{old_id}"', f'package="{test_id}"')
text = text.replace('android:name=".MainActivity"', f'android:name="{old_id}.MainActivity"')
text = text.replace('android:label="口袋抓娃乐园"', 'android:label="抓娃乐园触控测试"')
instrumentation = f'<instrumentation android:name="{old_id}.GrabProbe" android:targetPackage="{test_id}" />'
manifest.write_text(text.replace("</manifest>", instrumentation + "\n</manifest>"), encoding="utf-8")
shutil.copy2(source / "qa/android-grab/GrabProbe.java", target / "android/src/dev/playroom/pupclaw/GrabProbe.java")

with zipfile.ZipFile(apk) as package:
    for item in package.infolist():
        if item.is_dir() or not item.filename.startswith("assets/"):
            continue
        path = PurePosixPath(item.filename)
        if ".." in path.parts or "\\" in item.filename or ":" in item.filename:
            raise ValueError("Unexpected APK asset path")
        dest = target / "build" / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(package.read(item))
shutil.copy2(source / "qa/android-grab/probe.js", target / "build/assets/grab-probe.js")
shutil.copy2(source / "qa/medal-fixture.json", target / "build/assets/medal-fixture.json")
