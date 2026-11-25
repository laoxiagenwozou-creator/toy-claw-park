package dev.playroom.pupclaw;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

final class ParkAssets extends WebViewClient {
    private final Activity activity;
    private final Uri origin;
    private static final Set<String> CREDITS = new HashSet<>(Arrays.asList(
        "https://cappyadams.itch.io/skye-paw-patrol", "https://github.com/ArvinAIEngineer/Bluey",
        "https://sketchfab.com/3d-models/bingo-1bea574935ff4073b031e49c6c3dad93",
        "https://creativecommons.org/licenses/by-nc/4.0/", "https://creativecommons.org/licenses/by/4.0/"));

    ParkAssets(Activity activity, String localOrigin) {
        this.activity = activity;
        this.origin = Uri.parse(localOrigin);
    }

    @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if ("data".equals(url.getScheme()) || "blob".equals(url.getScheme())) return null;
        if (!origin.getScheme().equals(url.getScheme()) || !origin.getAuthority().equals(url.getAuthority())
                || !"GET".equals(request.getMethod())) return response("text/plain", 403, null);
        String path = url.getPath();
        if ("/".equals(path)) path = "/index.html";
        if (path == null || !(path.equals("/index.html") || path.equals("/park.css") || path.equals("/game.js")
                || path.matches("/media/[a-zA-Z0-9_-]+\\.(webp|png|glb|ogg)"))) return response("text/plain", 404, null);
        String type = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "application/javascript"
                : path.endsWith(".css") ? "text/css" : path.endsWith(".webp") ? "image/webp" : path.endsWith(".png") ? "image/png"
                : path.endsWith(".ogg") ? "audio/ogg" : "model/gltf-binary";
        try {
            return response(type, 200, activity.getAssets().open(path.substring(1)));
        } catch (IOException missing) {
            return response("text/plain", 404, null);
        }
    }
    private WebResourceResponse response(String type, int code, InputStream stream) {
        return new WebResourceResponse(type, type.startsWith("text/") || type.endsWith("javascript") ? "UTF-8" : null,
                code, code == 200 ? "OK" : code == 403 ? "Forbidden" : "Not Found",
                Collections.singletonMap("Cache-Control", "no-store"),
                stream != null ? stream : new ByteArrayInputStream(new byte[0]));
    }
    @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (request.isForMainFrame() && request.hasGesture() && CREDITS.contains(url.toString())) {
            try { activity.startActivity(new Intent(Intent.ACTION_VIEW, url)); }
            catch (ActivityNotFoundException absent) { Toast.makeText(activity, "本机没有可打开署名链接的浏览器", Toast.LENGTH_SHORT).show(); }
        }
        return true;
    }
}
