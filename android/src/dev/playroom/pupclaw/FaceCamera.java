package dev.playroom.pupclaw;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.graphics.ImageFormat;
import android.graphics.PointF;
import android.graphics.Rect;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CameraMetadata;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.CaptureResult;
import android.hardware.camera2.TotalCaptureResult;
import android.hardware.camera2.params.Face;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.media.FaceDetector;
import android.media.Image;
import android.media.ImageReader;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Range;
import android.util.Size;
import android.view.Display;
import android.view.Surface;

import java.nio.ByteBuffer;
import java.util.Collections;

final class FaceCamera {
    private static final int DETECTOR_LONG_EDGE = 320;
    private static final float BOX_TO_EYE_SPAN = 0.42f;
    private final MainActivity activity;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final Display display;
    private final PointF eyes = new PointF();
    private final FaceDetector.Face[] cpuFaces = new FaceDetector.Face[1];
    private volatile boolean closed;
    private CameraDevice device;
    private CameraCaptureSession session;
    private HandlerThread analyzer;
    private Handler analyzerHandler;
    private ImageReader reader;
    private Bitmap bitmap;
    private FaceDetector detector;
    private int[] pixels;
    private int sensorRotation;
    private int hwFaceMode = CameraMetadata.STATISTICS_FACE_DETECT_MODE_OFF;
    private Rect activeArray;
    private Range<Integer> fpsRange;
    private long lastFrame;

    FaceCamera(MainActivity activity) {
        this.activity = activity;
        display = activity.getWindowManager().getDefaultDisplay();
    }

    // The activity grants CAMERA before constructing this instance.
    @SuppressLint("MissingPermission")
    void open() {
        CameraManager manager = activity.getSystemService(CameraManager.class);
        if (manager == null) {
            activity.cameraFailed(this);
            return;
        }
        try {
            for (String id : manager.getCameraIdList()) {
                CameraCharacteristics properties = manager.getCameraCharacteristics(id);
                Integer facing = properties.get(CameraCharacteristics.LENS_FACING);
                if (facing == null || facing != CameraCharacteristics.LENS_FACING_FRONT) continue;
                StreamConfigurationMap outputs = properties.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
                if (outputs == null) continue;
                hwFaceMode = pickFaceDetectMode(properties.get(CameraCharacteristics.STATISTICS_INFO_AVAILABLE_FACE_DETECT_MODES));
                activeArray = properties.get(CameraCharacteristics.SENSOR_INFO_ACTIVE_ARRAY_SIZE);
                fpsRange = pickFpsRange(properties.get(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES));
                if (activeArray == null || activeArray.width() <= 0 || activeArray.height() <= 0) {
                    hwFaceMode = CameraMetadata.STATISTICS_FACE_DETECT_MODE_OFF;
                }
                Size size = captureSize(outputs.getOutputSizes(ImageFormat.YUV_420_888), hwFaceMode != CameraMetadata.STATISTICS_FACE_DETECT_MODE_OFF);
                if (size == null) continue;
                Integer orientation = properties.get(CameraCharacteristics.SENSOR_ORIENTATION);
                sensorRotation = orientation == null ? 0 : orientation;
                manager.openCamera(id, new CameraDevice.StateCallback() {
                    @Override
                    public void onOpened(CameraDevice camera) {
                        if (closed) camera.close();
                        else startCapture(camera, size);
                    }

                    @Override
                    public void onDisconnected(CameraDevice camera) {
                        camera.close();
                        activity.cameraFailed(FaceCamera.this);
                    }

                    @Override
                    public void onError(CameraDevice camera, int error) {
                        camera.close();
                        activity.cameraFailed(FaceCamera.this);
                    }
                }, main);
                return;
            }
        } catch (CameraAccessException | RuntimeException unavailable) {
            // The user can still play by dragging the chamber view.
        }
        activity.cameraFailed(this);
    }

    private static int pickFaceDetectMode(int[] modes) {
        if (modes == null) return CameraMetadata.STATISTICS_FACE_DETECT_MODE_OFF;
        int best = CameraMetadata.STATISTICS_FACE_DETECT_MODE_OFF;
        for (int mode : modes) {
            if (mode == CameraMetadata.STATISTICS_FACE_DETECT_MODE_FULL) return mode;
            if (mode == CameraMetadata.STATISTICS_FACE_DETECT_MODE_SIMPLE) best = mode;
        }
        return best;
    }

    private static Range<Integer> pickFpsRange(Range<Integer>[] ranges) {
        if (ranges == null) return null;
        Range<Integer> best = null;
        int bestScore = Integer.MIN_VALUE;
        for (Range<Integer> r : ranges) {
            int low = r.getLower(), high = r.getUpper();
            if (high > 30) continue;
            // Prefer steady 24-30 fps ranges so indoor auto-exposure never stalls tracking.
            int score = high * 100 + low * 10;
            if (score > bestScore) {
                bestScore = score;
                best = r;
            }
        }
        return best;
    }

    private Size captureSize(Size[] sizes, boolean hardwareFaces) {
        if (sizes == null) return null;
        double targetArea = hardwareFaces ? (320 * 240) : (640 * 480);
        Size closest = null;
        double best = Double.POSITIVE_INFINITY;
        for (Size size : sizes) {
            double aspect = size.getWidth() / (double) size.getHeight();
            double area = (double) size.getWidth() * size.getHeight();
            double cost = Math.abs(Math.log(area / targetArea)) + 1.7 * Math.abs(aspect - 4.0 / 3.0);
            if (cost < best) {
                closest = size;
                best = cost;
            }
        }
        return closest;
    }

    private void startCapture(CameraDevice camera, Size size) {
        device = camera;
        final boolean useHardware = hwFaceMode != CameraMetadata.STATISTICS_FACE_DETECT_MODE_OFF;
        try {
            analyzer = new HandlerThread("bud-face-analysis");
            analyzer.start();
            analyzerHandler = new Handler(analyzer.getLooper());
            reader = ImageReader.newInstance(size.getWidth(), size.getHeight(), ImageFormat.YUV_420_888, 3);
            reader.setOnImageAvailableListener(useHardware ? this::drainImage : this::analyzeCpu, analyzerHandler);
            Surface surface = reader.getSurface();
            CaptureRequest.Builder request = device.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
            request.addTarget(surface);
            if (fpsRange != null) {
                request.set(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, fpsRange);
            }
            if (useHardware) {
                request.set(CaptureRequest.STATISTICS_FACE_DETECT_MODE, hwFaceMode);
            }
            CameraCaptureSession.CaptureCallback captureCallback = useHardware
                    ? new CameraCaptureSession.CaptureCallback() {
                        @Override
                        public void onCaptureCompleted(CameraCaptureSession s, CaptureRequest req, TotalCaptureResult result) {
                            handleHardwareFaces(result);
                        }
                    }
                    : null;
            device.createCaptureSession(Collections.singletonList(surface), new CameraCaptureSession.StateCallback() {
                @Override
                public void onConfigured(CameraCaptureSession configured) {
                    if (closed) {
                        configured.close();
                        return;
                    }
                    session = configured;
                    try {
                        session.setRepeatingRequest(request.build(), captureCallback, analyzerHandler);
                    } catch (CameraAccessException | RuntimeException failure) {
                        activity.cameraFailed(FaceCamera.this);
                    }
                }

                @Override
                public void onConfigureFailed(CameraCaptureSession failed) {
                    failed.close();
                    activity.cameraFailed(FaceCamera.this);
                }
            }, main);
        } catch (CameraAccessException | RuntimeException failure) {
            activity.cameraFailed(this);
        }
    }

    private void drainImage(ImageReader source) {
        if (closed) return;
        try (Image image = source.acquireLatestImage()) {
            // Keep the ISP pipeline flowing with zero CPU pixel copies.
        } catch (RuntimeException ignored) {
        }
    }

    private void handleHardwareFaces(TotalCaptureResult result) {
        if (closed) return;
        Face[] detected = result.get(CaptureResult.STATISTICS_FACES);
        if (detected == null || detected.length == 0) return;
        Face best = null;
        long bestWeight = -1;
        for (Face candidate : detected) {
            Rect b = candidate.getBounds();
            if (b == null || b.width() <= 0 || b.height() <= 0) continue;
            long area = (long) b.width() * b.height();
            long weight = area * Math.max(1, candidate.getScore());
            if (weight > bestWeight) {
                bestWeight = weight;
                best = candidate;
            }
        }
        if (best == null) return;
        Rect crop = result.get(CaptureResult.SCALER_CROP_REGION);
        if (crop == null || crop.width() <= 0 || crop.height() <= 0) crop = activeArray;
        if (crop == null || crop.width() <= 0 || crop.height() <= 0) return;

        float cw = crop.width(), ch = crop.height();
        float u, v, spanNorm;
        boolean swap;
        int rotation = imageRotation();
        swap = rotation == 90 || rotation == 270;

        if (hwFaceMode == CameraMetadata.STATISTICS_FACE_DETECT_MODE_FULL
                && best.getLeftEyePosition() != null && best.getRightEyePosition() != null) {
            float lx = (best.getLeftEyePosition().x - crop.left) / cw;
            float ly = (best.getLeftEyePosition().y - crop.top) / ch;
            float rx = (best.getRightEyePosition().x - crop.left) / cw;
            float ry = (best.getRightEyePosition().y - crop.top) / ch;
            u = 0.5f * (lx + rx);
            v = 0.5f * (ly + ry);
            float dx = (rx - lx) * (swap ? ch : cw);
            float dy = (ry - ly) * (swap ? cw : ch);
            spanNorm = (float) Math.hypot(dx, dy) / (swap ? ch : cw);
        } else {
            Rect b = best.getBounds();
            u = (b.exactCenterX() - crop.left) / cw;
            v = (b.exactCenterY() - crop.top) / ch;
            float uprightWidth = (swap ? b.height() : b.width()) / (swap ? ch : cw);
            spanNorm = uprightWidth * BOX_TO_EYE_SPAN;
        }

        float xImg, yImg;
        switch (rotation) {
            case 90:  xImg = 1f - v; yImg = u; break;
            case 180: xImg = 1f - u; yImg = 1f - v; break;
            case 270: xImg = v;      yImg = 1f - u; break;
            default:  xImg = u;      yImg = v; break;
        }
        float x = 1f - xImg;
        float y = yImg;
        long now = SystemClock.elapsedRealtime();
        if (Float.isFinite(spanNorm) && Float.isFinite(x) && Float.isFinite(y)) {
            activity.faceFound(this, x, y, spanNorm, rotation, now);
        }
    }

    private void analyzeCpu(ImageReader source) {
        if (closed) return;
        try (Image image = source.acquireLatestImage()) {
            long now = SystemClock.elapsedRealtime();
            if (image == null || now - lastFrame < 36) return;
            lastFrame = now;
            int rotation = imageRotation();
            loadUprightLuma(image, rotation);
            if (detector.findFaces(bitmap, cpuFaces) == 0) return;
            FaceDetector.Face face = cpuFaces[0];
            if (face.confidence() < FaceDetector.Face.CONFIDENCE_THRESHOLD) return;
            face.getMidPoint(eyes);
            float span = face.eyesDistance() / bitmap.getWidth();
            float x = 1f - eyes.x / bitmap.getWidth();
            float y = eyes.y / bitmap.getHeight();
            if (Float.isFinite(span) && Float.isFinite(x) && Float.isFinite(y)) {
                activity.faceFound(this, x, y, span, rotation, now);
            }
        } catch (RuntimeException failure) {
            if (!closed) main.post(() -> activity.cameraFailed(this));
        }
    }

    private int imageRotation() {
        int degrees;
        switch (display.getRotation()) {
            case Surface.ROTATION_90: degrees = 90; break;
            case Surface.ROTATION_180: degrees = 180; break;
            case Surface.ROTATION_270: degrees = 270; break;
            default: degrees = 0;
        }
        // The front camera is not mirrored in the sensor active array or ImageReader buffer.
        return (sensorRotation + degrees) % 360;
    }

    private void loadUprightLuma(Image image, int rotation) {
        Rect crop = image.getCropRect();
        boolean swap = rotation == 90 || rotation == 270;
        int uprightWidth = swap ? crop.height() : crop.width();
        int uprightHeight = swap ? crop.width() : crop.height();
        double scale = Math.min(1, DETECTOR_LONG_EDGE / (double) Math.max(uprightWidth, uprightHeight));
        int width = Math.max(2, ((int) (uprightWidth * scale)) & ~1);
        int height = Math.max(2, (int) (uprightHeight * scale));
        if (bitmap == null || bitmap.getWidth() != width || bitmap.getHeight() != height) {
            if (bitmap != null) bitmap.recycle();
            bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
            detector = new FaceDetector(width, height, cpuFaces.length);
            pixels = new int[width * height];
        }

        Image.Plane luma = image.getPlanes()[0];
        ByteBuffer data = luma.getBuffer();
        int offset = data.position();
        int rowStride = luma.getRowStride();
        int columnStride = luma.getPixelStride();
        int index = 0;
        for (int y = 0; y < height; y++) {
            int v = y * uprightHeight / height;
            for (int x = 0; x < width; x++) {
                int u = x * uprightWidth / width;
                int px;
                int py;
                switch (rotation) {
                    case 90: px = v; py = crop.height() - 1 - u; break;
                    case 180: px = crop.width() - 1 - u; py = crop.height() - 1 - v; break;
                    case 270: px = crop.width() - 1 - v; py = u; break;
                    default: px = u; py = v;
                }
                int gray = data.get(offset + (py + crop.top) * rowStride + (px + crop.left) * columnStride) & 255;
                pixels[index++] = 0xff000000 | gray << 16 | gray << 8 | gray;
            }
        }
        bitmap.setPixels(pixels, 0, width, 0, 0, width, height);
    }

    void close() {
        closed = true;
        if (session != null) session.close();
        if (device != null) device.close();
        if (analyzerHandler != null) {
            if (reader != null) reader.setOnImageAvailableListener(null, null);
            analyzerHandler.post(() -> {
                if (reader != null) reader.close();
                if (bitmap != null) bitmap.recycle();
                analyzer.quitSafely();
            });
        }
    }
}
