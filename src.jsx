import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const crops = {
  Wheat: { label: "गेहूँ", water: 450, fertilizer: 120, price: 2450, disease: "पीला रतुआ (डेमो अनुमान)", treatment: "प्रभावित पौधों की पहचान के लिए स्थानीय कृषि विज्ञान केंद्र (KVK) से सलाह लें।" },
  Rice: { label: "धान", water: 1200, fertilizer: 100, price: 2300, disease: "पत्ती धब्बा (डेमो अनुमान)", treatment: "फोटो केवल शुरुआती संकेत देती है। सही निदान और उपचार के लिए KVK/कृषि अधिकारी से सलाह लें।" },
  Tomato: { label: "टमाटर", water: 600, fertilizer: 90, price: 1800, disease: "अर्ली ब्लाइट (डेमो अनुमान)", treatment: "पत्तियों की स्पष्ट फोटो लें और KVK/कृषि अधिकारी से पुष्टि कराएँ।" },
};

const buyerData = [
  { name: "शिव फ्रेश प्रोड्यूस (डेमो)", type: "सब्ज़ी खरीदार", distance: "2.4 km", price: "₹1,750/क्विंटल", x: 22, y: 28 },
  { name: "ग्रीन बास्केट रेस्टोरेंट (डेमो)", type: "रेस्तराँ", distance: "4.1 km", price: "₹1,820/क्विंटल", x: 67, y: 43 },
  { name: "स्थानीय मंडी व्यापारी (डेमो)", type: "व्यापारी", distance: "6.8 km", price: "₹1,700/क्विंटल", x: 44, y: 72 },
];

export default function App() {
  const [crop, setCrop] = useState("Tomato");
  const [area, setArea] = useState("2");
  const [soil, setSoil] = useState("मध्यम");
  const [photo, setPhoto] = useState(null);
  const [voiceText, setVoiceText] = useState("");
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [stage, setStage] = useState("overview");
  const [yieldLoss, setYieldLoss] = useState(8);
  const [harvestDate, setHarvestDate] = useState("2026-10-20");
  const [buyerFilter, setBuyerFilter] = useState("सभी");
  const [listening, setListening] = useState(false);

  const details = crops[crop];
  const acres = Math.max(0, Number(area) || 0);
  const water = Math.round(details.water * acres * (soil === "रेतीली" ? 1.15 : soil === "चिकनी" ? 0.9 : 1));
  const fertilizer = Math.round(details.fertilizer * acres * (soil === "कम उपजाऊ" ? 1.1 : 1));
  const gross = Math.round(details.price * 18 * acres * (1 - yieldLoss / 100));
  const costs = Math.round(acres * 9500 + fertilizer * 8);
  const profit = gross - costs;

  const speak = (text) => {
    setVoiceText(text);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया Chrome में कोशिश करें।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setVoiceText(text);
      const lower = text.toLowerCase();
      if (lower.includes("धान")) setCrop("Rice");
      else if (lower.includes("गेह") || lower.includes("गेहूं")) setCrop("Wheat");
      else if (lower.includes("टमाटर")) setCrop("Tomato");
      speak(`आपने कहा: ${text}। चुनी गई फसल ${crops[lower.includes("धान") ? "Rice" : lower.includes("गेह") ? "Wheat" : "Tomato"].label} है।`);
    };
    recognition.start();
  };

  const uploadPhoto = (file) => {
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setShowDiagnosis(false);
  };

  const filteredBuyers = buyerData.filter((b) => buyerFilter === "सभी" || b.type === buyerFilter);

  const nav = [
    ["overview", "डैशबोर्ड"],
    ["grow", "पानी और खाद"],
    ["health", "फसल स्वास्थ्य"],
    ["market", "मंडी अनुमान"],
    ["buyers", "खरीदार"],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon">🌱</div><div><b>FasalSaathi</b><small>बीज से बाज़ार तक</small></div></div>
        <div className="season-tag"><span className="dot"></span> खरीफ सीज़न · डेमो</div>
        <nav>{nav.map(([id, label]) => <button key={id} className={stage === id ? "nav-item active" : "nav-item"} onClick={() => setStage(id)}>{label}</button>)}</nav>
        <div className="sidebar-bottom"><div className="avatar">क</div><div><b>किसान डैशबोर्ड</b><small>नमस्ते, किसान जी</small></div></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><div className="eyebrow">आपका स्मार्ट खेती सहायक</div><h1>नमस्ते, किसान जी <span>👋</span></h1><p>आपकी फसल, आपका फैसला — एक ही जगह।</p></div>
          <button className={`voice-button ${listening ? "listening" : ""}`} onClick={startVoice}>🎙 {listening ? "सुन रहा है…" : "हिंदी में बोलें"}</button>
        </header>
        {voiceText && <div className="voice-result"><span>🎧</span><span>{voiceText}</span><button onClick={() => setVoiceText("")}>×</button></div>}

        {stage === "overview" && <>
          <section className="hero">
            <div className="hero-copy"><span className="pill light">आपका AI खेती साथी</span><h2>बेहतर खेती।<br/><em>बेहतर मुनाफ़ा।</em></h2><p>फसल उगाने से लेकर बेचने तक, सही फैसले लेने में मदद। आसान हिंदी में।</p><button className="hero-cta" onClick={() => setStage("grow")}>अपनी फसल देखें <span>→</span></button></div>
            <div className="hero-art"><div className="sun"></div><div className="hill hill-back"></div><div className="hill hill-front"></div><div className="crop-lines">🌾　🌿　🌾<br/>🌿　🌾　🌿</div></div>
          </section>
          <div className="section-heading"><div><h2>आपकी खेती के 4 कदम</h2><p>हर चरण में एक स्मार्ट फैसला</p></div><span className="muted">सीज़न प्रगति <b>2/4</b></span></div>
          <div className="feature-grid">
            <button className="feature-card" onClick={() => setStage("grow")}><div className="feature-icon green">💧</div><span className="card-step">01 · उगाना</span><h3>पानी और खाद</h3><p>फसल और खेत के हिसाब से अनुमानित मात्रा।</p><span className="card-link">कैलकुलेटर खोलें ↗</span></button>
            <button className="feature-card" onClick={() => setStage("health")}><div className="feature-icon orange">🍃</div><span className="card-step">02 · फसल बढ़ना</span><h3>फसल स्वास्थ्य</h3><p>पत्ते की फोटो से शुरुआती संकेत देखें।</p><span className="card-link">फोटो जाँचें ↗</span></button>
            <button className="feature-card" onClick={() => setStage("market")}><div className="feature-icon blue">📈</div><span className="card-step">03 · कटाई के बाद</span><h3>मंडी का अनुमान</h3><p>डेमो ट्रेंड और बेचने की संभावित विंडो।</p><span className="card-link">बाज़ार देखें ↗</span></button>
            <button className="feature-card" onClick={() => setStage("buyers")}><div className="feature-icon purple">🤝</div><span className="card-step">04 · बेचना</span><h3>सीधे खरीदार</h3><p>नज़दीकी खरीदारों के डेमो विकल्प।</p><span className="card-link">खरीदार खोजें ↗</span></button>
          </div>
          <div className="bottom-grid">
            <section className="panel crop-panel"><div className="panel-title"><div><h3>आपकी फसल का सारांश</h3><p>अपनी जानकारी बदलकर देखें</p></div><span className="live-label">● लाइव डेमो</span></div>
              <div className="form-row"><label>फसल चुनें<select value={crop} onChange={e => setCrop(e.target.value)}><option value="Tomato">टमाटर</option><option value="Wheat">गेहूँ</option><option value="Rice">धान</option></select></label><label>खेत का आकार (एकड़)<input type="number" min="0" step=".5" value={area} onChange={e => setArea(e.target.value)}/></label></div>
              <div className="summary-stats"><div><small>पानी का अनुमान</small><b>{water.toLocaleString("en-IN")} L</b></div><div><small>खाद का अनुमान</small><b>{fertilizer} kg</b></div><div><small>संभावित मुनाफ़ा*</small><b className={profit >= 0 ? "positive" : "negative"}>₹{profit.toLocaleString("en-IN")}</b></div></div>
              <small className="disclaimer">* केवल नमूना गणना; वास्तविक उपज, लागत और स्थानीय सलाह के अनुसार बदलें।</small>
            </section>
            <section className="panel voice-panel"><div className="voice-big">🎙️</div><h3>बोलिए, खेती कीजिए</h3><p>टाइप करने की ज़रूरत नहीं। हिंदी में पूछें और जवाब सुनें।</p><button className="outline-button" onClick={startVoice}>माइक शुरू करें <span>→</span></button><small>वॉइस सुविधा ब्राउज़र पर निर्भर है।</small></section>
          </div>
        </>}

        {stage === "grow" && <section className="workspace"><div className="section-heading"><div><h2>पानी और खाद कैलकुलेटर</h2><p>फसल और मिट्टी के आधार पर एक शुरुआती अनुमान</p></div><span className="pill">01 · उगाना</span></div>
          <div className="panel calculator"><div className="form-row"><label>फसल<select value={crop} onChange={e => setCrop(e.target.value)}><option value="Tomato">टमाटर</option><option value="Wheat">गेहूँ</option><option value="Rice">धान</option></select></label><label>खेत का आकार (एकड़)<input type="number" min="0" step=".5" value={area} onChange={e => setArea(e.target.value)}/></label><label>मिट्टी का प्रकार<select value={soil} onChange={e => setSoil(e.target.value)}><option>मध्यम</option><option>रेतीली</option><option>चिकनी</option><option>कम उपजाऊ</option></select></label></div>
          <div className="result-grid"><div className="result-tile"><span>💧</span><small>पानी का शुरुआती अनुमान</small><b>{water.toLocaleString("en-IN")} लीटर</b><p>फसल और मिट्टी के चुने गए विकल्पों पर आधारित।</p></div><div className="result-tile"><span>🌾</span><small>खाद का शुरुआती अनुमान</small><b>{fertilizer} किलोग्राम</b><p>मात्रा मिट्टी परीक्षण और कृषि सलाह से पुष्टि करें।</p></div></div>
          <div className="notice">⚠️ यह हैकाथॉन डेमो है, प्रमाणित कृषि सलाह नहीं। वास्तविक मात्रा के लिए मिट्टी परीक्षण और स्थानीय कृषि अधिकारी/KVK की सलाह लें।</div><button className="primary-button" onClick={() => speak(`${details.label} के लिए अनुमानित पानी ${water} लीटर और खाद ${fertilizer} किलोग्राम है। यह डेमो अनुमान है। सही मात्रा के लिए मिट्टी परीक्षण कराएँ।`)}>🔊 अनुमान हिंदी में सुनें</button></div></section>}

        {stage === "health" && <section className="workspace"><div className="section-heading"><div><h2>फसल स्वास्थ्य जाँच</h2><p>पत्ते की फोटो जोड़कर डेमो परिणाम देखें</p></div><span className="pill">02 · फसल बढ़ना</span></div>
          <div className="health-layout"><div className="panel upload-panel"><div className="upload-zone">{photo ? <img src={photo} alt="अपलोड किया गया पत्ता"/> : <div className="upload-placeholder"><span>🍃</span><b>पत्ते की फोटो अपलोड करें</b><small>साफ़, अच्छी रोशनी वाली फोटो चुनें</small></div>}<label className="upload-button">फोटो चुनें<input type="file" accept="image/*" onChange={e => uploadPhoto(e.target.files?.[0])}/></label></div><button className="primary-button full" onClick={() => setShowDiagnosis(true)}>फोटो का डेमो विश्लेषण करें</button><p className="disclaimer">इस प्रोटोटाइप में वास्तविक AI मॉडल जुड़ा नहीं है। फोटो अपलोड केवल इंटरफ़ेस डेमो है।</p></div>
          <div className="panel diagnosis-panel"><div className="panel-title"><div><h3>विश्लेषण रिपोर्ट</h3><p>AI सहायता · डेमो</p></div><span className="feature-icon orange">🔎</span></div>{showDiagnosis ? <><div className="diagnosis-badge">डेमो परिणाम · पुष्टि आवश्यक</div><h2>{details.disease}</h2><p>यह परिणाम चुनी गई फसल के आधार पर नमूने के रूप में दिखाया गया है — अपलोड की गई फोटो से वास्तविक पहचान नहीं हुई।</p><div className="notice">सलाह: {details.treatment}</div><div className="loss-control"><label>संभावित उपज पर असर (डेमो): <b>{yieldLoss}%</b></label><input type="range" min="0" max="40" value={yieldLoss} onChange={e => setYieldLoss(Number(e.target.value))}/><small>यह स्लाइडर केवल अनुमानित मुनाफ़े का डेमो बदलता है।</small></div><button className="outline-button" onClick={() => speak(`${details.disease}। ध्यान दें, यह केवल डेमो परिणाम है, असली पहचान नहीं। ${details.treatment}`)}>🔊 हिंदी में सुनें</button></> : <div className="empty-state"><span>🧪</span><b>आपकी रिपोर्ट यहाँ दिखेगी</b><p>फोटो अपलोड करें और डेमो विश्लेषण बटन दबाएँ।</p></div>}</div></div></section>}

        {stage === "market" && <section className="workspace"><div className="section-heading"><div><h2>मंडी भाव और बेचने का समय</h2><p>नमूना ट्रेंड के आधार पर संभावित बिक्री विंडो</p></div><span className="pill">03 · कटाई के बाद</span></div>
          <div className="market-layout"><div className="panel market-main"><div className="panel-title"><div><h3>{details.label} · नमूना मंडी भाव</h3><p>₹ प्रति क्विंटल · असली लाइव डेटा नहीं</p></div><span className="live-label demo">● सिम्युलेटेड</span></div><div className="price-big">₹{details.price.toLocaleString("en-IN")}<small>/क्विंटल</small></div><div className="chart">{[48,42,55,38,33,44,27,35,20,26,17,22].map((h,i)=><div key={i} className="bar-wrap"><div className={`bar ${i===11?"bar-current":""}`} style={{height:`${h*2.2}px`}}></div><small>{["1","2","3","4","5","6","7","8","9","10","11","12"][i]}</small></div>)}</div><div className="chart-legend"><span>● पिछले 12 अवधि का नमूना ट्रेंड</span><span>● वर्तमान डेमो</span></div></div>
          <div className="panel sell-window"><div className="window-icon">🗓️</div><small>बेचने की संभावित विंडो</small><h2>अगले 7 दिन</h2><p>डेमो ट्रेंड के अनुसार तुलना करने के लिए सुझाई गई विंडो। यह वास्तविक भविष्यवाणी नहीं है।</p><label>अनुमानित कटाई तारीख<input type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)}/></label><button className="primary-button full" onClick={() => {setStage("buyers"); speak("मंडी का यह अनुमान केवल डेमो है। खरीदारों के विकल्प अब दिखाए जा रहे हैं।");}}>इस विंडो के खरीदार देखें →</button></div></div>
          <div className="notice">ℹ️ मंडी भाव बदलते रहते हैं। असली फैसले से पहले Agmarknet या सरकारी मंडी स्रोत से ताज़ा भाव जाँचें। इस प्रोटोटाइप में लाइव डेटा/API नहीं जुड़ी है।</div></section>}

        {stage === "buyers" && <section className="workspace"><div className="section-heading"><div><h2>सीधे खरीदार खोजें</h2><p>मंडी से आगे — स्थानीय खरीदारों तक पहुँचने का डेमो</p></div><span className="pill">04 · बेचना</span></div>
          <div className="buyer-layout"><div className="panel map-panel"><div className="panel-title"><div><h3>आपके आसपास के खरीदार</h3><p>काल्पनिक स्थान · असली लोकेशन नहीं</p></div><span className="feature-icon green">📍</span></div><div className="fake-map"><div className="map-road road-a"></div><div className="map-road road-b"></div><div className="map-road road-c"></div><div className="map-water"></div><div className="map-label label-a">खेती क्षेत्र</div>{buyerData.map((b,i)=><div key={b.name} className="map-pin" style={{left:`${b.x}%`,top:`${b.y}%`}} title={b.name}><span>{i+1}</span></div>)}</div><div className="map-legend"><span>📍 3 नमूना खरीदार</span><span>🗺️ डेमो मैप</span></div></div>
          <div className="panel buyer-list"><div className="panel-title"><div><h3>खरीदारों की सूची</h3><p>कीमतों की तुलना करें</p></div></div><select value={buyerFilter} onChange={e => setBuyerFilter(e.target.value)}><option>सभी</option><option>सब्ज़ी खरीदार</option><option>रेस्तराँ</option><option>व्यापारी</option></select>{filteredBuyers.map((b,i)=><div className="buyer-row" key={b.name}><div className="buyer-number">{i+1}</div><div className="buyer-info"><b>{b.name}</b><small>{b.type} · {b.distance}</small><strong>{b.price}</strong></div><button className="contact-button" onClick={() => speak(`${b.name} एक नमूना खरीदार है। यह संपर्क जानकारी वास्तविक नहीं है।`)}>जानें</button></div>)}<div className="notice">खरीदार, दूरी और कीमतें काल्पनिक डेमो डेटा हैं। कोई वास्तविक संपर्क या ऑर्डर उपलब्ध नहीं है।</div></div></div></section>}

        <footer><span>🌱 FasalSaathi</span><span>हैकाथॉन प्रोटोटाइप · वास्तविक कृषि/बाज़ार सलाह नहीं</span></footer>
      </main>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
