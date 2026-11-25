package dev.playroom.pupclaw;

import android.app.Activity;
import android.app.Instrumentation;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.util.Scanner;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;

/** Drives real Android touch events into the attached WebView of a separate test application. */
public final class GrabProbe extends Instrumentation {
    private static final String TEST_PACKAGE = "dev.playroom.pocketclawgrabqa";
    private Activity activity;
    private WebView web;
    private Context context;
    private String scenario;
    private String stage;
    private boolean baseline;
    private final Bundle report = new Bundle();

    @Override public void onCreate(Bundle args) {
        super.onCreate(args);
        scenario = args == null ? "single" : args.getString("scenario", "single");
        stage = args == null ? "snow" : args.getString("stage", "snow");
        baseline = args != null && "true".equals(args.getString("baseline"));
        start();
    }

    private String js(String code) throws Exception {
        ArrayBlockingQueue<String> answer = new ArrayBlockingQueue<>(1);
        runOnMainSync(() -> web.evaluateJavascript(code, answer::offer));
        String result = answer.poll(10, TimeUnit.SECONDS);
        if (result == null) throw new IllegalStateException("WebView callback timed out");
        return result;
    }

    private boolean until(String expression, long timeout) throws Exception {
        long end = SystemClock.elapsedRealtime()+timeout;
        do {
            if ("true".equals(js("Boolean("+expression+")"))) return true;
            Thread.sleep(60);
        } while (SystemClock.elapsedRealtime()<end);
        return false;
    }

    private float[] position(String selector, float dx, float dy) throws Exception {
        String code = "(()=>{const r=document.querySelector("+JSONObject.quote(selector)+").getBoundingClientRect();"
            +"return [(r.left+r.width*(0.5+"+dx+"))/innerWidth,(r.top+r.height*(0.5+"+dy+"))/innerHeight]})()";
        JSONArray xy = new JSONArray(js(code));
        int[] origin=new int[2];
        runOnMainSync(()->web.getLocationOnScreen(origin));
        return new float[]{origin[0]+(float)xy.getDouble(0)*web.getWidth(),origin[1]+(float)xy.getDouble(1)*web.getHeight()};
    }

    private void touch(long start, int action, float[]... points) {
        MotionEvent.PointerProperties[] props = new MotionEvent.PointerProperties[points.length];
        MotionEvent.PointerCoords[] coords = new MotionEvent.PointerCoords[points.length];
        for(int i=0;i<points.length;i++){
            props[i]=new MotionEvent.PointerProperties();
            props[i].id=i; props[i].toolType=MotionEvent.TOOL_TYPE_FINGER;
            coords[i]=new MotionEvent.PointerCoords();
            coords[i].x=points[i][0]; coords[i].y=points[i][1]; coords[i].pressure=1; coords[i].size=.1f;
        }
        if (!context.getPackageName().equals(TEST_PACKAGE) || !web.hasWindowFocus())
            throw new IllegalStateException("Test window lost focus");
        MotionEvent event=MotionEvent.obtain(start,SystemClock.uptimeMillis(),action,points.length,props,coords,
            0,0,1,1,0,0,InputDevice.SOURCE_TOUCHSCREEN,0);
        try {
            if(!getUiAutomation().injectInputEvent(event,true))throw new IllegalStateException("Android touch was not delivered");
        } finally {event.recycle();}
    }

    private void press(String selector,float dx,float dy,int ms) throws Exception {
        float[] point=position(selector,dx,dy);
        long start=SystemClock.uptimeMillis();
        touch(start,MotionEvent.ACTION_DOWN,point); Thread.sleep(ms); touch(start,MotionEvent.ACTION_UP,point);
    }

    private void tap(String selector) throws Exception {
        String expr = "(()=>{const e=document.querySelector("+JSONObject.quote(selector)+");if(!e)return false;"
            +"const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);"
            +"return r.width>0 && r.height>0 && (e.contains(hit) || (e.id==='grab' && e.disabled && hit?.closest('.grab-control')===e.closest('.grab-control')))})()";
        if (!until(expr,5500)) throw new IllegalStateException("Control did not become visible: "+selector);
        press(selector,0,0,70);
    }

    private void aimFirstToy() throws Exception {
        // Steer through Android's input dispatcher and observe the rendered claw
        // between nudges, just as a player corrects the aim by looking at it.
        JSONArray samples=new JSONArray();
        for(String axis:new String[]{"x","z"}){
            double target=axis.equals("x")?-1.49:1.47;
            for(int n=0;n<16;n++){
                double delta=target-Double.parseDouble(js("grabProbe.arm."+axis));
                if(Math.abs(delta)<.095)break;
                samples.put(new JSONArray().put(axis).put(delta));
                report.putString("aimCorrections",samples.toString());
                if(n==15)throw new IllegalStateException("Stick did not reach first toy on "+axis);
                float stick=(float)Math.copySign(Math.abs(delta)<.4?.18:.37,delta);
                int ms=(int)Math.max(55,Math.min(270,Math.abs(delta)*1000/2.05));
                float[] center=position("#joystick",0,0),offset=position("#joystick",axis.equals("x")?stick:0,axis.equals("z")?stick:0);
                long start=SystemClock.uptimeMillis();
                touch(start,MotionEvent.ACTION_DOWN,center);Thread.sleep(45);
                touch(start,MotionEvent.ACTION_MOVE,offset);Thread.sleep(ms);
                touch(start,MotionEvent.ACTION_UP,offset);
                Thread.sleep(190);
            }
        }
    }

    private void twoThumbs(String selector, boolean slideOff) throws Exception {
        float[] stick=position("#joystick",.32f,0), button=position(selector,0,0);
        float[] end=slideOff?position("#status",0,0):button;
        long start=SystemClock.uptimeMillis();
        touch(start,MotionEvent.ACTION_DOWN,stick); Thread.sleep(170);
        touch(start,MotionEvent.ACTION_POINTER_DOWN | (1<<MotionEvent.ACTION_POINTER_INDEX_SHIFT),stick,button);
        Thread.sleep(80);
        if(slideOff){touch(start,MotionEvent.ACTION_MOVE,stick,end);Thread.sleep(60);}
        touch(start,MotionEvent.ACTION_POINTER_UP | (1<<MotionEvent.ACTION_POINTER_INDEX_SHIFT),stick,end);
        Thread.sleep(160); touch(start,MotionEvent.ACTION_UP,stick);
    }

    private void screenshot(String step) throws Exception {
        if (!context.getPackageName().equals(TEST_PACKAGE) || !web.hasWindowFocus()) return;
        Bitmap screen=getUiAutomation().takeScreenshot();
        if(screen==null)return;
        String prefix="snow".equals(stage)?scenario:stage+"-"+scenario;
        File file=new File(context.getExternalFilesDir(null),prefix+"-"+step+".png");
        try(FileOutputStream out=new FileOutputStream(file)){screen.compress(Bitmap.CompressFormat.PNG,100,out);}
        finally {screen.recycle();}
    }

    private void checkAllowanceUpgrade() throws Exception {
        for(int old:new int[]{17,-17}){
            File dir=new File(context.getCacheDir(),"test-allowance-"+System.nanoTime());
            if(!dir.mkdir())throw new IllegalStateException("No test directory");
            try(DataOutputStream out=new DataOutputStream(new FileOutputStream(new File(dir,"prepaid-claw-turn")))){
                out.writeInt(old);
            }
            PrepaidTurn one=new PrepaidTurn(dir),two=new PrepaidTurn(dir);
            JSONArray upgraded=new JSONArray(one.configure(0,24,true,true,17));
            if(upgraded.getInt(1)!=(old>0?24:23)||upgraded.getInt(3)!=old)throw new IllegalStateException("2.9.2 credit was lost or replayed");
            if(old>0 && !new JSONArray(one.take(0,17)).getBoolean(4))throw new IllegalStateException("Old prepaid credit did not work");
            if(new JSONArray(two.take(0,17)).getBoolean(4))throw new IllegalStateException("Spent credit replayed");
            one.configure(1,1,true,false,17);
            int serial=new JSONArray(two.insert(1)).getInt(3);
            if(new JSONArray(one.insert(1)).getBoolean(4) || new JSONArray(one.take(0,serial)).getBoolean(4))throw new IllegalStateException("Duplicate reservation or stale allowance accepted");
            one.configure(2,2,true,false,serial);
            if(new JSONArray(two.take(1,serial)).getBoolean(4) || new JSONArray(two.configure(1,999,true,true,serial)).getInt(1)!=2)
                throw new IllegalStateException("Parent replacement failed to invalidate an old allowance");
            for(int i=0;i<2;i++){
                int id=new JSONArray(one.insert(2)).getInt(3);
                if(!new JSONArray(two.take(2,id)).getBoolean(4))throw new IllegalStateException("Valid coin refused");
            }
            if(new JSONArray(one.insert(2)).getBoolean(4) || new JSONArray(two.current()).getInt(1)!=0)
                throw new IllegalStateException("Limit exceeded");
        }
        report.putString("upgrade","legacy active and already-used serials retained; parent replacement and exact final coin verified");
    }

    private void exerciseAdmission() throws Exception {
        boolean slow="slow".equals(scenario),blocked="blocked".equals(scenario);
        boolean legacy="legacy".equals(scenario);
        boolean prepaid=!baseline && "true".equals(js("typeof BudNative.currentCoinSlot==='function'"));
        if(legacy&&prepaid)checkAllowanceUpgrade();
        if("no-click".equals(scenario))
            js("document.addEventListener('click',e=>{if(e.target.closest('#coin-insert,#grab-control'))e.stopImmediatePropagation()},true)");
        if(prepaid&&(slow||blocked||legacy)){
            js("grabProbe.holdWallet()");
            if(!until("grabProbe.holding",3500))throw new IllegalStateException("Fixture did not acquire wallet");
        }
        if(!legacy)tap("#coin-insert");
        if(!until("!document.querySelector('#grab').disabled",3500))throw new IllegalStateException("Prepaid tap did not register");
        if(!prepaid&&(slow||blocked)){
            js("grabProbe.holdWallet()");
            if(!until("grabProbe.holding",3500))throw new IllegalStateException("Fixture did not acquire wallet");
        }
        js("grabProbe.timeNextTouch()");tap("#grab");
        // Give the WebView a full second without another input, screenshot, or evaluation.
        Thread.sleep(1000);
        report.putString("whileWaiting",js("grabProbe.snapshot()"));
        if(prepaid&&(slow||blocked||legacy)){
            if(!"true".equals(js("grabProbe.firstDrop!==null && grabProbe.minY<4 && JSON.parse(BudNative.currentCoinSlot())[3]<0 && grabProbe.holding")))
                throw new IllegalStateException("Prepaid claw was held up by the wallet");
        }else if(slow||blocked){
            if(baseline) {
                if(!"true".equals(js("grabProbe.firstDrop===null && document.querySelector('#grab-label').textContent==='下爪中' && document.querySelector('#coin-action').textContent==='已投币'")))
                    throw new IllegalStateException("Old wait did not reproduce");
            }else if(!"true".equals(js("grabProbe.firstDrop!==null && grabProbe.minY>5.5 && grabProbe.minY<6 && document.querySelector('#grab-label').textContent==='验币中'")))
                throw new IllegalStateException("No immediate, safe movement before payment");
            if(blocked&&!baseline){
                Thread.sleep(2300);
                report.putString("retryReady",js("grabProbe.snapshot()"));
                if(!"true".equals(js("!document.querySelector('#grab').disabled && document.querySelector('#coin-action').textContent==='已投币' && Math.abs(grabProbe.arm.y-6.26)<.01")))
                    throw new IllegalStateException("Wallet timeout did not restore the prepaid turn");
            }
            js("grabProbe.release=true");
            if(blocked&&!baseline){
                if(!until("!grabProbe.holding",1800))throw new IllegalStateException("Fixture did not release wallet");
                js("grabProbe.timeNextTouch()");tap("#grab");
            }
        }
        // Inspect only after the entire normal cycle could have finished without another touch.
        Thread.sleep(5500);
        report.putString("cycle",js("grabProbe.snapshot()"));
        report.putString("events",js("grabProbe.events"));
        if(!"true".equals(js("grabProbe.minY<1 && Math.abs(grabProbe.arm.y-6.26)<.01 && !document.querySelector('#menu-button').disabled && document.querySelector('#coin-action').textContent==='投币' && document.querySelector('#coin-balance').textContent.includes('3') && !grabProbe.errors.length")))
            throw new IllegalStateException("Empty drop or debit did not complete");
        if(prepaid&&(slow||blocked||legacy)){
            if(!"true".equals(js("(()=>{const [r,,,s]=JSON.parse(BudNative.currentCoinSlot());return grabProbe.holding && !JSON.parse(BudNative.takeClawCoin(r,-s))[4]})()")))
                throw new IllegalStateException("Used turn was playable twice");
            int remaining=3;
            if(blocked){
                tap("#coin-insert");
                if(!until("!document.querySelector('#grab').disabled && grabProbe.holding",2000))throw new IllegalStateException("Next coin could not be inserted while database busy");
                js("grabProbe.timeNextTouch()");tap("#grab");Thread.sleep(5200);
                if(!"true".equals(js("grabProbe.holding && grabProbe.minY<1 && grabProbe.arm.y>6.25 && !document.querySelector('#menu-button').disabled && document.querySelector('#coin-balance').textContent.includes('2')")))
                    throw new IllegalStateException("Second paid cycle did not finish");
                remaining=2; report.putString("secondCycle",js("grabProbe.snapshot()"));
            }
            if(blocked||legacy){
                // The old page still has the wallet locked. Reload before its
                // deferred debit can finish and verify the original two copies.
                js("window.grabTestOldPage=true");
                runOnMainSync(web::reload);
                if(!until("!window.grabTestOldPage && document.querySelector('.stage-card')",18000))throw new IllegalStateException("Reload failed");
            }else js("grabProbe.release=true");
            if(!until("document.querySelector('#coin-action').textContent==='投币' && document.querySelector('#coin-balance').textContent.includes('"+remaining+"')",9000))
                throw new IllegalStateException("Prepaid credit replayed after reload");
            js("(()=>{const r=indexedDB.open('toy-park-family',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('family'),s=t.objectStore('family');const a=s.get('local'),b=s.get('last-good');t.oncomplete=()=>{window.testSettled=[a.result,b.result].every(x=>x.coins==="+remaining+"&&!x.inserted&&x.turnNumber===-JSON.parse(BudNative.currentCoinSlot())[3]);db.close()}}})()");
            if(!until("window.testSettled===true",7000))throw new IllegalStateException("Wallet did not settle once in both copies");
            report.putString("prepaid", "completed while IndexedDB was locked; duplicate refused; both wallet copies contain "+remaining+" coins");
        }
        report.putString("result","completed");
    }

    private void checkMedals() throws Exception {
        String saved="JSON.parse(localStorage.getItem('toy-park-v2')).snow";
        tap("#coin-insert");
        if(!until("!document.querySelector('#grab').disabled",4000))throw new IllegalStateException("Test coin failed");
        tap("#grab");
        if(!until("!document.getElementById('win').hidden && "+saved+".clears===1",20000))
            throw new IllegalStateException("Sixth prize did not award a medal");
        Thread.sleep(700);screenshot("award");
        tap("#win-wall");
        if(!until("document.getElementById('wall-summary').textContent.includes('6 / 12') && document.querySelectorAll('#wall-grid .earned').length===6",3000))
            throw new IllegalStateException("Legacy and new medals did not share the gallery");
        // The Android compositor can still hold the award frame after showModal updates the DOM.
        js("window.medalWallPainted=false;requestAnimationFrame(()=>requestAnimationFrame(()=>window.medalWallPainted=true))");
        if(!until("window.medalWallPainted",3000))throw new IllegalStateException("Gallery did not paint");
        Thread.sleep(150);screenshot("wall");tap(".medal-slot[data-stage=snow]");
        String card="#wall-medal .foil-card";
        float[] middle=position(card,0,0),side=position(card,.34f,-.23f);long start=SystemClock.uptimeMillis();
        touch(start,MotionEvent.ACTION_DOWN,middle);Thread.sleep(55);touch(start,MotionEvent.ACTION_MOVE,side);Thread.sleep(240);
        if(!"true".equals(js("parseFloat(document.querySelector('#wall-medal button').style.getPropertyValue('--yaw'))>5")))
            throw new IllegalStateException("Finger did not tilt the foil");
        screenshot("tilt");touch(start,MotionEvent.ACTION_UP,side);Thread.sleep(160);
        if(!"true".equals(js("document.querySelector('#wall-medal button').getAttribute('aria-pressed')==='false'")))
            throw new IllegalStateException("Drag accidentally flipped medal");
        tap(card);Thread.sleep(430);screenshot("back");
        if(!"true".equals(js("document.querySelector('#wall-medal button').getAttribute('aria-pressed')==='true' && document.getElementById('coin-balance').textContent.includes('3') && !grabProbe.errors.length")))
            throw new IllegalStateException("Flip or test balance incorrect");
        tap("#wall-close");tap("#win-menu");tap("#wall-open");
        report.putString("wall",js("document.getElementById('wall-summary').textContent"));
        report.putString("coin",js("document.getElementById('coin-balance').textContent"));
        report.putString("round",js(saved+".round"));report.putString("medals",js(saved+".clears"));
        report.putString("result","sixth touch catch, mixed wall, drag, flip, re-open and single debit passed");
    }

    @Override public void onStart(){
        int code=Activity.RESULT_CANCELED;
        try {
            context=getTargetContext();
            if (!TEST_PACKAGE.equals(context.getPackageName())) throw new IllegalStateException("Use the disposable test package");
            if (context.getSystemService(KeyguardManager.class).isKeyguardLocked()) throw new IllegalStateException("Tablet is locked");
            activity=startActivitySync(new Intent(context,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            runOnMainSync(()->{
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                ViewGroup root=activity.findViewById(android.R.id.content);
                web=(WebView)root.getChildAt(0);
            });
            if (!until("document.querySelector('.stage-card') && document.visibilityState==='visible'",22000)) throw new IllegalStateException("Menu did not open");
            // Start each scenario with the same toys, even after a previous test moved or won one.
            js("localStorage.removeItem('toy-park-v2');window.grabTestOldPage=true");
            boolean medals="medals".equals(scenario);
            if(medals){
                try(InputStream stream=context.getAssets().open("medal-fixture.json"); Scanner scanner=new Scanner(stream,"UTF-8")){
                    js("localStorage.setItem('toy-park-v2',"+JSONObject.quote(scanner.useDelimiter("\\A").next())+")");
                }
            }
            runOnMainSync(web::reload);
            if(!until("!window.grabTestOldPage && document.querySelector('.stage-card')",22000)) throw new IllegalStateException("Test board did not reload");
            try(InputStream stream=context.getAssets().open("grab-probe.js"); Scanner scanner=new Scanner(stream,"UTF-8")){
                js(scanner.useDelimiter("\\A").next());
            }
            boolean legacy="legacy".equals(scenario);
            js("grabProbe.seed("+("prize".equals(scenario)||medals?100:0)+","+legacy+")");
            if (!until("document.querySelector('#coin-balance').textContent.includes('"+(legacy?3:4)+"') && document.querySelector('#coin-action').textContent==='"+(legacy?"已投币":"投币")+"'",6000)) throw new IllegalStateException("Test wallet did not load");
            if (!stage.matches("snow|pony|peppa|sheriff|chicks|spidey")) throw new IllegalArgumentException("Unknown test stage");
            String card = ".stage-card[data-stage="+stage+"]";
            js("grabProbe.bayX=[...document.querySelectorAll('.stage-card')].indexOf(document.querySelector("+JSONObject.quote(card)+"))*10.85");
            tap(card);
            if(!until("document.querySelector('#machine').dataset.mode==='play' && !document.querySelector('#menu-button').disabled && grabProbe.arm",38000)) throw new IllegalStateException("Stage did not draw");
            if(medals){checkMedals();code=Activity.RESULT_OK;return;}
            if (legacy||"slow".equals(scenario)||"blocked".equals(scenario)||"no-click".equals(scenario)||"quiet".equals(scenario)){
                exerciseAdmission();code=Activity.RESULT_OK;return;
            }
            if (!"snow".equals(stage)) {
                tap("#request-open");
                if (!until("document.querySelector('#playroom').open && !document.querySelector('#room-request').hidden",5500)) throw new IllegalStateException("Request card did not appear");
                tap("#accept-request");
                if (!until("document.querySelector('#mission-card').dataset.state==='accepted'",5500)) throw new IllegalStateException("Request did not open");
                tap("#room-close");
            }
            tap("#grab");
            Thread.sleep(200);
            report.putString("unfunded",js("grabProbe.snapshot()"));
            screenshot("before");
            if(!"two".equals(scenario))aimFirstToy();
            report.putString("aim",js("grabProbe.arm"));
            tap("#coin-insert");
            if(!until("!document.querySelector('#grab').disabled",5500))throw new IllegalStateException("Insert failed");
            js("grabProbe.begin()");
            if("two".equals(scenario))twoThumbs("#grab",false); else tap("#grab");
            boolean moved=until("grabProbe.minY<4.6",3600);
            if(moved)screenshot("lowered");
            boolean ready=moved && until("!document.querySelector('#menu-button').disabled",16000);
            report.putString("cycle",js("grabProbe.snapshot()"));
            report.putString("events",js("grabProbe.events"));
            report.putString("result",moved&&ready?"completed":"no complete drop");
            if(!ready)throw new IllegalStateException("Claw failed to lower and finish");
            if(!"true".equals(js("Math.hypot(grabProbe.arm.x+.78,grabProbe.arm.y-6.26,grabProbe.arm.z+.38)<.02"
                +" && document.querySelector('#coin-action').textContent==='投币' && document.querySelector('#coin-balance').textContent.includes('3')"
                +" && grabProbe.errors.length===0"))) throw new IllegalStateException("Home pose or single charge mismatch");
            screenshot("home");
            press("#joystick",.38f,0,460);Thread.sleep(280);
            report.putString("afterStick",js("grabProbe.arm"));
            if(!"true".equals(js("grabProbe.arm.x>-.35")))throw new IllegalStateException("Joystick did not resume");
            if (!"snow".equals(stage)) {
                tap("#outlet");
                if (!until("document.querySelector('#toy-view').dataset.ready==='true' && !document.querySelector('#room-detail').hidden",8500)) throw new IllegalStateException("Prize did not reach outlet");
                report.putString("prize", js("document.querySelector('#toy-view').dataset.kind"));
                tap("#place-toy");
                String saved="JSON.parse(localStorage.getItem('toy-park-v2'))."+stage;
                if (!until(saved+".shelf.request==='complete' && "+saved+".total===1",5500)) throw new IllegalStateException("Prize was not delivered");
                report.putString("shelf",js(saved+".shelf"));
                screenshot("collection");
            }else if("prize".equals(scenario)){
                if(!"true".equals(js("JSON.parse(localStorage.getItem('toy-park-v2')).snow.shelf.pending.snowPenguin===1")))
                    throw new IllegalStateException("Penguin did not reach outlet");
                tap("#outlet");
                if(!until("document.querySelector('#toy-view').dataset.ready==='true' && document.querySelector('#toy-view').dataset.kind==='snowPenguin'",8000))
                    throw new IllegalStateException("Wrong prize at the outlet");
                tap("#place-toy");
                if(!until("JSON.parse(localStorage.getItem('toy-park-v2')).snow.shelf.owned.snowPenguin===1",5000))
                    throw new IllegalStateException("Penguin did not reach collection");
                report.putString("collected","snowPenguin");
            }
            if("two".equals(scenario)){
                twoThumbs("#coin-insert",false);
                if(!until("!document.querySelector('#grab').disabled",3500))throw new IllegalStateException("Two-thumb coin failed");
                js("grabProbe.begin()");
                twoThumbs("#grab",true);
                if(!"true".equals(js("grabProbe.minY>6 && !document.querySelector('#grab').disabled")))throw new IllegalStateException("Sliding away spent a coin");
                twoThumbs("#grab",false);
                tap("#grab");
                if(!until("grabProbe.minY<4.6",3500)||!until("!document.querySelector('#menu-button').disabled",16000))throw new IllegalStateException("Next turn stuck");
                report.putString("secondCycle",js("grabProbe.snapshot()"));
                if(!"true".equals(js("document.querySelector('#coin-balance').textContent.includes('2') && document.querySelector('#coin-action').textContent==='投币' && grabProbe.errors.length===0")))throw new IllegalStateException("Repeat tap or slide changed the allowance");
            }
            code=Activity.RESULT_OK;
        }catch(Exception e){
            report.putString("error",e.toString());
            try{
                if(web!=null && web.hasWindowFocus()){
                    report.putString("screenState",js("({machine:document.querySelector('#machine')?.dataset.stage,mode:document.querySelector('#machine')?.dataset.mode,dialog:document.querySelector('#playroom')?.open,mission:document.querySelector('#mission-card')?.dataset.state,theme:document.querySelector('#room-theme')?.textContent,events:window.grabProbe?.events})"));
                    screenshot("error");
                }
            }catch(Exception ignored){}
        }
        finally{
            if(activity!=null)runOnMainSync(activity::finish);
            finish(code,report);
        }
    }
}
