import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import Vibrant from "node-vibrant";
import { hexToAllFormats, rgbToHex, cmykToHex, hslToHex, hsvToHex, labToHex, isValidHex } from "../utils/colorConvert.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Services = () => {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || "").toLowerCase().startsWith("ar");
  const {
    calculatePaint,
    convertColorMatch,
    colorSystems,
    fetchColorSystems,
    paints,
  } = useAppContext();

  // --- States ---
  const [activeTab, setActiveTab] = useState("calc");
  const [loading, setLoading] = useState(false);

  // Simulation States — استخراج 5 ألوان تلقائياً من الصورة + اختيار لون بالضغط
  const [_selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [copiedHexIndex, setCopiedHexIndex] = useState(null);
  const [pickedColor, setPickedColor] = useState(null); // اللون المختار بالضغط على الصورة
  const [pickerPin, setPickerPin] = useState(null); // { x, y } موضع الدبوس على الصورة (%)
  const [copiedPicked, setCopiedPicked] = useState(false);
  const imageRef = useRef(null);
  const canvasRef = useRef(null); // canvas مخفي لقراءة البيكسلات

  const copyExtractedHex = (hex, index) => {
    const text = (hex || "").startsWith("#") ? hex : "#" + hex;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedHexIndex(index);
      setTimeout(() => setCopiedHexIndex(null), 2000);
    });
  };

  const copyPickedHex = (hex) => {
    const text = (hex || "").startsWith("#") ? hex : "#" + hex;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPicked(true);
      setTimeout(() => setCopiedPicked(false), 2000);
    });
  };

  // الضغط على الصورة لاستخراج لون نقطة محددة
  const handleImageClick = (e) => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // تحويل إحداثيات العرض إلى إحداثيات الصورة الطبيعية
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const naturalX = Math.round(clickX * scaleX);
    const naturalY = Math.round(clickY * scaleY);

    // رسم الصورة على canvas ثم قراءة البيكسل
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    const pixel = ctx.getImageData(
      Math.min(naturalX, img.naturalWidth - 1),
      Math.min(naturalY, img.naturalHeight - 1),
      1, 1
    ).data;

    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();

    setPickedColor({ hex, r, g, b });
    // نسبة موضع الدبوس على الصورة المعروضة
    setPickerPin({
      x: (clickX / rect.width) * 100,
      y: (clickY / rect.height) * 100,
    });
  };

  // Calc & Convert States
  const [calcType, setCalcType] = useState("dimensions");
  const [calcInputs, setCalcInputs] = useState({});
  const [calcResult, setCalcResult] = useState(null);
  const [convertInputs, setConvertInputs] = useState({
    sourceColorId: "",
    targetSystemId: "",
  });
  const [sourceCodeSystem, setSourceCodeSystem] = useState("hex"); // "hex" | "rgb" | "cmyk" | ... | "sys-1", "sys-2" (أنظمة مستهدفة كمصدر)
  const [sourceHex, setSourceHex] = useState("667788");
  const [sourceSelectedCode, setSourceSelectedCode] = useState(""); // عند اختيار نظام كمصدر: الكود المختار (مثل RAL 9010)
  const [sourceSystemPalette, setSourceSystemPalette] = useState([]); // ألوان النظام المختار كمصدر [{ code, hex }, ...]
  const [convertResult, setConvertResult] = useState(null);

  // تحميل كل أنظمة الألوان عند فتح المحول (للنظام المستهدف وقائمة مصدر الكود)
  useEffect(() => {
    if (activeTab === "converter" && (!colorSystems || colorSystems.length === 0)) {
      fetchColorSystems?.();
    }
  }, [activeTab, colorSystems, fetchColorSystems]);

  // عند اختيار نظام لون كمصدر، جلب ألوانه
  useEffect(() => {
    if (!sourceCodeSystem.startsWith("sys-")) {
      return;
    }
    const systemId = sourceCodeSystem.replace("sys-", "");
    if (!systemId) return;
    axios
      .get(`${API_URL}/colors`, { params: { systemId } })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setSourceSystemPalette(list.map((c) => ({ code: c.code || c.name || "", hex: (c.hex || "").replace(/^#/, "") })));
        setSourceSelectedCode("");
      })
      .catch(() => setSourceSystemPalette([]));
  }, [sourceCodeSystem]);

  const normalizedHex = (sourceHex || "").trim().replace(/^#/, "").replace(/[^0-9A-Fa-f]/g, "");
  const fullHex = normalizedHex.length === 6 && /^[0-9A-Fa-f]{6}$/.test(normalizedHex)
    ? "#" + normalizedHex
    : normalizedHex.length === 3 && /^[0-9A-Fa-f]{3}$/.test(normalizedHex)
      ? "#" + normalizedHex[0] + normalizedHex[0] + normalizedHex[1] + normalizedHex[1] + normalizedHex[2] + normalizedHex[2]
      : null;
  const sourceFormats = fullHex ? hexToAllFormats(fullHex) : null;
  // لون الدائرة الصغيرة بجانب الكود — يتغير فوراً حسب الكود المدخل (HEX كامل أو جزئي يُكمّل بأصفار)
  const paddedForSwatch =
    normalizedHex.length >= 6 ? normalizedHex.slice(0, 6) : (normalizedHex + "000000").slice(0, 6);
  const paddedHex = /^[0-9A-Fa-f]{6}$/.test(paddedForSwatch) ? "#" + paddedForSwatch : null;
  const swatchHex =
    sourceFormats?.hex || fullHex || paddedHex || "#667788";
  const sourceRgb = sourceFormats?.rgb ?? { r: 102, g: 119, b: 136 };
  const sourceCmyk = sourceFormats?.cmyk ?? { c: 25, m: 12, y: 0, k: 47 };
  const sourceHsl = sourceFormats?.hsl ?? { h: 210, s: 14, l: 47 };
  const sourceHsv = sourceFormats?.hsv ?? { h: 210, s: 21, v: 53 };
  const sourceLab = sourceFormats?.lab ?? { l: 49.2, a: -2.2, b: -11.4 };

  // --- Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedColors([]);
      setPickedColor(null);
      setPickerPin(null);
    }
  };

  // استخراج 5 ألوان بارزة من الصورة عند جاهزية المعاينة (node-vibrant)
  useEffect(() => {
    if (!previewUrl || activeTab !== "simulation") return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
    setLoading(true);
      Vibrant.from(img)
        .getPalette()
        .then((palette) => {
          const keys = ["Vibrant", "DarkVibrant", "LightVibrant", "Muted", "DarkMuted"];
          const list = [];
          for (const k of keys) {
            const swatch = palette[k];
            if (swatch) {
              let hex = typeof swatch.hex === "string" ? swatch.hex : (swatch.getHex && swatch.getHex()) || null;
              if (hex) {
                hex = hex.startsWith("#") ? hex : "#" + hex;
                list.push({ hex: hex.toUpperCase(), title: k });
              }
            }
          }
          setExtractedColors(list.slice(0, 5));
        })
        .catch((err) => {
          console.error("Vibrant extraction error:", err);
          setExtractedColors([]);
        })
        .finally(() => setLoading(false));
    };
    img.onerror = () => {
      setExtractedColors([]);
    };
    img.src = previewUrl;
    return () => { img.src = ""; };
  }, [previewUrl, activeTab]);
  const handleCalculate = async () => {
    const res = await calculatePaint(calcInputs);
    if (res.success) setCalcResult(res.data);
  };

  const targetFormatOptions = ["hex", "cmyk", "rgb", "hsl", "lab"];
  const isFormatTarget = targetFormatOptions.includes(convertInputs.targetSystemId);

  const handleConvert = async () => {
    const hex = (sourceHex || "").trim().replace(/^#/, "");
    const validHex = hex.length === 6 && /^[0-9A-Fa-f]{6}$/.test(hex);
    if (!validHex) {
      alert(t("services.converter.alerts.enter_hex"));
      return;
    }
    if (!convertInputs.targetSystemId) {
      alert(t("services.converter.alerts.select_target"));
      return;
    }

    setConvertResult(null);

    // إذا اختار صيغة عرض (HEX, CMYK, RGB, HSL, LAB) — نعرض اللون بتلك الصيغة بدون استدعاء API وتحديث الدائرة
    if (isFormatTarget) {
      const fmt = sourceFormats;
      const rawHex = fmt?.hex || "#" + hex;
      const hexForCircle = rawHex.startsWith("#") ? rawHex : "#" + rawHex;
      if (!hexForCircle || hexForCircle.length < 7) return;
      setConvertResult({
        originalColor: { hex: hexForCircle, rgb: fmt?.rgb, cmyk: fmt?.cmyk, hsl: fmt?.hsl, lab_l: fmt?.lab?.l, lab_a: fmt?.lab?.a, lab_b: fmt?.lab?.b },
        matchedColor: { hex: hexForCircle, rgb: fmt?.rgb, cmyk: fmt?.cmyk, hsl: fmt?.hsl, lab_l: fmt?.lab?.l, lab_a: fmt?.lab?.a, lab_b: fmt?.lab?.b, code: t("services.converter.results.display_format") },
        comparison: null,
      });
      return;
    }

    const numTarget = parseInt(convertInputs.targetSystemId, 10);
    if (!Number.isFinite(numTarget) || numTarget < 1) return;

    const payload = {
      ...(sourceCodeSystem === "rgb"
        ? { rgb: { r: sourceRgb.r, g: sourceRgb.g, b: sourceRgb.b } }
        : { hex: "#" + hex }),
      targetSystemId: numTarget,
    };

    const res = await convertColorMatch(payload);
    if (res.success) {
      setConvertResult(res.data);
    } else {
      alert(res.error || t("services.converter.alerts.convert_failed"));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {t("services.title")}
      </h1>

      <div className="flex space-x-4 mb-8 border-b border-gray-200 pb-2">
        {["calc", "converter", "simulation"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 font-medium transition-all ${
              activeTab === tab
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {t(
              `services.tabs.${tab === "calc" ? "calculator" : tab === "converter" ? "converter" : "simulation"}`,
            )}
          </button>
        ))}{" "}
      </div>

      {/* Paint Calculator Content */}
      {activeTab === "calc" && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-3xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {t("services.calculator.header")}
          </h2>

          <div className="flex items-center space-x-6 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer text-gray-600">
              <input
                type="radio"
                name="type"
                checked={calcType === "dimensions"}
                onChange={() => setCalcType("dimensions")}
                className="w-4 h-4 text-blue-600"
              />
              <span>{t("services.calculator.types.dimensions")}</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-gray-600">
              <input
                type="radio"
                name="type"
                checked={calcType === "area"}
                onChange={() => setCalcType("area")}
                className="w-4 h-4 text-blue-600"
              />
              <span>{t("services.calculator.types.area")}</span>
            </label>
          </div>

          <div className="space-y-6">
            {calcType === "dimensions" ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    {t("services.calculator.fields.length")}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) =>
                      setCalcInputs({ ...calcInputs, length: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    {t("services.calculator.fields.width")}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) =>
                      setCalcInputs({ ...calcInputs, width: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    {t("services.calculator.fields.height")}
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) =>
                      setCalcInputs({ ...calcInputs, height: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  {t("services.calculator.fields.total_area")}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setCalcInputs({ totalArea: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                {t("services.calculator.fields.paint_product")}
              </label>
              <select
                className="w-full border border-gray-300 p-3 rounded-lg bg-white"
                onChange={(e) =>
                  setCalcInputs({ ...calcInputs, paintId: e.target.value })
                }
              >
                <option value="">
                  {t("services.calculator.fields.paint_placeholder")}
                </option>
                {paints?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading
                ? t("services.calculator.actions.loading")
                : t("services.calculator.actions.calculate")}
            </button>
          </div>

          {calcResult && (
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg space-y-3">
              <h4 className="text-blue-800 font-bold mb-2">
                {t("services.calculator.results.title")}
              </h4>
              {calcResult.productName && (
                <p className="text-gray-700">
                  {t("services.calculator.results.product")}:{" "}
                  <span className="font-semibold">{calcResult.productName}</span>
                </p>
              )}
              {(calcResult.wallArea != null || calcResult.areaWithCeilingAndFloor != null) ? (
                <>
                  <p className="text-gray-700 font-medium">
                    {t("services.calculator.results.area_walls_only")}:{" "}
                    <span className="font-bold text-blue-800">{calcResult.wallArea ?? "—"} m²</span>
                  </p>
                  <p className="text-gray-700 font-medium">
                    {t("services.calculator.results.area_with_ceiling_floor")}:{" "}
                    <span className="font-bold text-blue-800">{calcResult.areaWithCeilingAndFloor ?? calcResult.area ?? "—"} m²</span>
                  </p>
                </>
              ) : (
              <p className="text-gray-600">
                {t("services.calculator.results.total_area")}:{" "}
                <span className="font-semibold">{calcResult.area} m²</span>
              </p>
              )}
              <p className="text-gray-600">
                {t("services.calculator.results.coverage")}:{" "}
                <span className="font-semibold">{calcResult.coverage} m²/kg</span>
              </p>
              <p className="text-gray-600">
                {t("services.calculator.results.weight_per_can")}:{" "}
                <span className="font-semibold">{calcResult.weightKg} kg</span>
              </p>
              <p className="text-gray-600">
                {t("services.calculator.results.kg_needed")}:{" "}
                <span className="font-semibold">{calcResult.kgNeeded} kg</span>
              </p>
              <p className="text-2xl text-blue-900 mt-2 pt-2 border-t border-blue-200">
                {t("services.calculator.results.recommended")}:{" "}
                <span className="font-black">
                  {calcResult.recommendedQuantity ?? calcResult.numberOfCans}{" "}
                  {calcResult.recommendedQuantity === 1 ? t("services.calculator.results.cans") : t("services.calculator.results.cans_plural")}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Color Converter Content — تصميم فاتح واحترافي */}
      {activeTab === "converter" && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("services.converter.header")}
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
              {t("services.converter.badge")}
            </span>
          </div>

          {/* صف 1: منطقة إدخال الكود — كبيرة وتحتوي كل العناصر */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 md:p-6 w-full mb-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-3">
              {t("services.converter.source_system_label")}
                </label>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <select
                className="rounded-xl bg-white border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium min-w-[140px]"
                value={sourceCodeSystem}
                onChange={(e) => setSourceCodeSystem(e.target.value)}
              >
                <option value="hex">{t("services.converter.source_system_hex")}</option>
                <option value="rgb">{t("services.converter.source_system_rgb")}</option>
                <option value="cmyk">{t("services.converter.source_system_cmyk")}</option>
                <option value="hsl">{t("services.converter.source_system_hsl")}</option>
                <option value="hsv">{t("services.converter.source_system_hsv")}</option>
                <option value="lab">{t("services.converter.source_system_lab")}</option>
                {colorSystems?.length > 0 && (
                  <>
                    <option disabled>——</option>
                    {colorSystems.map((s) => (
                      <option key={s.id} value={`sys-${s.id}`}>
                        {s.name}
                  </option>
                    ))}
                  </>
                )}
              </select>
              <div className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 px-4 py-3 flex-1 min-w-[260px] shadow-sm">
                  <div
                    className="w-12 h-12 rounded-full shrink-0 shadow-inner ring-2 ring-gray-300 ring-offset-2"
                    style={{ backgroundColor: swatchHex || "#667788" }}
                    title={swatchHex || "#667788"}
                  />
                  {sourceCodeSystem.startsWith("sys-") ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <>
                        <select
                          className="flex-1 min-w-0 rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          value={sourceSelectedCode}
                          onChange={(e) => {
                            const code = e.target.value;
                            setSourceSelectedCode(code);
                            const item = sourceSystemPalette.find((c) => c.code === code);
                            if (item?.hex) setSourceHex(item.hex.replace(/^#/, ""));
                          }}
                        >
                          <option value="">{t("services.converter.select_source_code")}</option>
                          {sourceSystemPalette.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code}
                            </option>
                          ))}
                        </select>
                        <button type="button" onClick={() => { setSourceSelectedCode(""); }} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                      </>
                    </div>
                  ) : sourceCodeSystem === "hex" ? (
                    <>
                      <input
                        type="text"
                        placeholder="667788"
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-0"
                        value={(sourceHex || "").replace(/^#/, "").trim().toUpperCase()}
                        onChange={(e) => setSourceHex(e.target.value.replace(/[^0-9A-Fa-f]/g, "").trim().slice(0, 6))}
                      />
                      <button type="button" onClick={() => setSourceHex("")} className="text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                    </>
                  ) : sourceCodeSystem === "rgb" ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input type="number" min={0} max={255} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="R" value={sourceRgb.r} onChange={(e) => setSourceHex(rgbToHex(e.target.value, sourceRgb.g, sourceRgb.b))} />
                      <input type="number" min={0} max={255} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="G" value={sourceRgb.g} onChange={(e) => setSourceHex(rgbToHex(sourceRgb.r, e.target.value, sourceRgb.b))} />
                      <input type="number" min={0} max={255} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="B" value={sourceRgb.b} onChange={(e) => setSourceHex(rgbToHex(sourceRgb.r, sourceRgb.g, e.target.value))} />
                      <button type="button" onClick={() => setSourceHex("000000")} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                    </div>
                  ) : sourceCodeSystem === "cmyk" ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="C" value={sourceCmyk.c} onChange={(e) => setSourceHex(cmykToHex(e.target.value, sourceCmyk.m, sourceCmyk.y, sourceCmyk.k))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="M" value={sourceCmyk.m} onChange={(e) => setSourceHex(cmykToHex(sourceCmyk.c, e.target.value, sourceCmyk.y, sourceCmyk.k))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Y" value={sourceCmyk.y} onChange={(e) => setSourceHex(cmykToHex(sourceCmyk.c, sourceCmyk.m, e.target.value, sourceCmyk.k))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="K" value={sourceCmyk.k} onChange={(e) => setSourceHex(cmykToHex(sourceCmyk.c, sourceCmyk.m, sourceCmyk.y, e.target.value))} />
                      <button type="button" onClick={() => setSourceHex("000000")} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                    </div>
                  ) : sourceCodeSystem === "hsl" ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input type="number" min={0} max={360} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="H" value={sourceHsl.h} onChange={(e) => setSourceHex(hslToHex(e.target.value, sourceHsl.s, sourceHsl.l))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="S%" value={sourceHsl.s} onChange={(e) => setSourceHex(hslToHex(sourceHsl.h, e.target.value, sourceHsl.l))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="L%" value={sourceHsl.l} onChange={(e) => setSourceHex(hslToHex(sourceHsl.h, sourceHsl.s, e.target.value))} />
                      <button type="button" onClick={() => setSourceHex("000000")} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                    </div>
                  ) : sourceCodeSystem === "hsv" ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input type="number" min={0} max={360} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="H" value={sourceHsv.h} onChange={(e) => setSourceHex(hsvToHex(e.target.value, sourceHsv.s, sourceHsv.v))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="S%" value={sourceHsv.s} onChange={(e) => setSourceHex(hsvToHex(sourceHsv.h, e.target.value, sourceHsv.v))} />
                      <input type="number" min={0} max={100} className="w-12 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="V%" value={sourceHsv.v} onChange={(e) => setSourceHex(hsvToHex(sourceHsv.h, sourceHsv.s, e.target.value))} />
                      <button type="button" onClick={() => setSourceHex("000000")} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input type="number" min={0} max={100} step={0.1} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="L" value={sourceLab.l} onChange={(e) => setSourceHex(labToHex(e.target.value, sourceLab.a, sourceLab.b))} />
                      <input type="number" min={-128} max={127} step={0.1} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="a" value={sourceLab.a} onChange={(e) => setSourceHex(labToHex(sourceLab.l, e.target.value, sourceLab.b))} />
                      <input type="number" min={-128} max={127} step={0.1} className="w-14 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="b" value={sourceLab.b} onChange={(e) => setSourceHex(labToHex(sourceLab.l, sourceLab.a, e.target.value))} />
                      <button type="button" onClick={() => setSourceHex("000000")} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors" aria-label="Clear">×</button>
                    </div>
                  )}
                </div>
              </div>
              </div>

          {/* صف 2: اختيار النظام المستهدف — أنظمة المطابقة (RAL, Pantone...) + صيغ العرض (HEX, CMYK, RGB, HSL, LAB) */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 md:p-6 w-full mb-5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-3">
                  {t("services.converter.fields.target_label")}
                </label>
                <select
              className="w-full rounded-xl bg-white border-2 border-gray-300 px-4 py-3 pr-10 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer font-medium text-sm"
              value={String(convertInputs.targetSystemId ?? "")}
                  onChange={(e) =>
                setConvertInputs((prev) => ({ ...prev, targetSystemId: e.target.value || "" }))
              }
              aria-label={t("services.converter.fields.target_label")}
            >
              <option value="">{t("services.converter.target_placeholder")}</option>
              <optgroup label={t("services.converter.target_group_systems")}>
                {(colorSystems || []).map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label={t("services.converter.target_group_formats")}>
                <option value="hex">HEX</option>
                <option value="cmyk">CMYK</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
                <option value="lab">LAB</option>
              </optgroup>
                </select>
            <p className="text-xs text-gray-500 mt-2">
              {t("services.converter.target_hint_full")}
            </p>
            </div>

          {/* صف 3: زر البحث — أسفل الحقول */}
          <div className="w-full mb-8">
            <button
              type="button"
              onClick={handleConvert}
              disabled={
                loading ||
                !convertInputs.targetSystemId ||
                !isValidHex("#" + (sourceHex || "").replace(/^#/, "")) ||
                (!isFormatTarget && sourceCodeSystem.startsWith("sys-") && !sourceSelectedCode)
              }
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none border border-indigo-700/30"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                  <span>{t("services.converter.actions.loading")}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{t("services.converter.actions.convert")}</span>
                </>
              )}
            </button>
          </div>
          {colorSystems?.length === 0 && (
            <p className="text-xs text-amber-600 mb-2">{t("services.converter.no_systems")}</p>
          )}

          {/* Row 3: الدائرة تعرض اللون المرسل (أصلي) واللون الناتج؛ عند صيغ العرض = لون الكود الحالي (الدائرة الصغيرة نفسها) */}
          {(() => {
            // عند اختيار صيغة عرض (HEX, CMYK, RGB...) الدائرة الكبيرة تعكس لون الكود الحالي (نفس الدائرة الصغيرة)
            const formatColor = isFormatTarget ? swatchHex : null;
            const leftColor = convertResult?.originalColor?.hex || formatColor || sourceFormats?.hex || swatchHex || "#667788";
            const rightColor = convertResult?.matchedColor?.hex || formatColor || sourceFormats?.hex || swatchHex || "#94a3b8";
            const norm = (h) => (h || "").replace(/^#/, "").toLowerCase();
            const sameColor = norm(leftColor) === norm(rightColor);
            return (
              <div className="flex justify-center mb-8">
                <div
                  className="w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg"
                      style={{
                    ...(sameColor
                      ? { backgroundColor: leftColor }
                      : { background: `linear-gradient(to right, ${leftColor} 50%, ${rightColor} 50%)` }),
                    transform: isRtl ? "rotate(180deg)" : undefined,
                      }}
                    />
                    </div>
            );
          })()}

          {/* Row 4: Two columns of details — Original (left) | Matched (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                {t("services.converter.results.original")}
                    </h3>
              {(() => {
                const o = convertResult?.originalColor;
                const fmt = o || sourceFormats;
                if (!fmt) {
                  return (
                    <p className="text-xs text-gray-500">
                      {t("services.converter.hint_convert")}
                    </p>
                  );
                }
                return (
                  <div className="text-xs font-mono text-gray-600 space-y-1">
                    <p>HEX {(o?.hex || fmt.hex || "").toUpperCase()}</p>
                    <p>CMYK {[fmt.cmyk?.c ?? 0, fmt.cmyk?.m ?? 0, fmt.cmyk?.y ?? 0, fmt.cmyk?.k ?? 0].join("/")}</p>
                    <p>RGB {[fmt.rgb?.r ?? 0, fmt.rgb?.g ?? 0, fmt.rgb?.b ?? 0].join(" ")}</p>
                    <p>HSL {fmt.hsl?.h ?? 0}, {(fmt.hsl?.s ?? 0)}%, {(fmt.hsl?.l ?? 0)}%</p>
                    {(o?.lab_l != null || fmt.lab) && (
                      <p>LAB {Number(o?.lab_l ?? fmt.lab?.l).toFixed(2)}, {Number(o?.lab_a ?? fmt.lab?.a).toFixed(2)}, {Number(o?.lab_b ?? fmt.lab?.b).toFixed(2)}</p>
                    )}
                  </div>
                );
              })()}
                </div>
            <div className="space-y-2 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">
                {t("services.converter.results.matched")}
                    </h3>
              {convertResult?.matchedColor ? (
                <div className="text-xs font-mono text-gray-600 space-y-1">
                  {convertResult.matchedColor.code && (
                    <p className="text-indigo-700 font-semibold">{convertResult.matchedColor.code}</p>
                  )}
                  <p>HEX {(convertResult.matchedColor.hex || "").toUpperCase()}</p>
                  <p>CMYK {[convertResult.matchedColor.cmyk?.c ?? 0, convertResult.matchedColor.cmyk?.m ?? 0, convertResult.matchedColor.cmyk?.y ?? 0, convertResult.matchedColor.cmyk?.k ?? 0].join(" ")}</p>
                  <p>RGB {[convertResult.matchedColor.rgb?.r ?? 0, convertResult.matchedColor.rgb?.g ?? 0, convertResult.matchedColor.rgb?.b ?? 0].join(" ")}</p>
                  <p>HSL {convertResult.matchedColor.hsl?.h ?? 0}, {(convertResult.matchedColor.hsl?.s ?? 0)}%, {(convertResult.matchedColor.hsl?.l ?? 0)}%</p>
                  {convertResult.matchedColor.lab_l != null && (
                    <p>LAB {Number(convertResult.matchedColor.lab_l).toFixed(2)}, {Number(convertResult.matchedColor.lab_a).toFixed(2)}, {Number(convertResult.matchedColor.lab_b).toFixed(2)}</p>
                  )}
                  {convertResult?.comparison?.deltaE != null && (
                    <p className="text-gray-500 pt-1">∆E {convertResult.comparison.deltaE} · {convertResult.comparison.matchPercentage}%</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {convertResult ? t("services.converter.results.no_match") : t("services.converter.hint_convert")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Color Simulation Content */}
      {activeTab === "simulation" && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                  <span className="text-gray-500 font-medium">
                    {t("services.simulation.upload_label", {
                      defaultValue: "رفع صورة لاختبار الألوان",
                    })}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              </div>

              {previewUrl && (
                <>
                  {/* canvas مخفي لقراءة ألوان البيكسل */}
                  <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

                  <div
                    className="relative border-4 border-white shadow-xl rounded-lg overflow-hidden group select-none"
                    style={{ cursor: "crosshair" }}
                    onClick={handleImageClick}
                  >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Preview"
                      className="w-full h-auto pointer-events-none"
                      crossOrigin="anonymous"
                    />

                    {/* دبوس موضع الضغط */}
                    {pickerPin && pickedColor && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${pickerPin.x}%`,
                          top: `${pickerPin.y}%`,
                          transform: "translate(-50%, -100%)",
                        }}
                      >
                        {/* مؤشر اللون المختار */}
                        <div
                          className="w-8 h-8 rounded-full border-4 border-white shadow-lg ring-2 ring-black/30"
                          style={{ backgroundColor: pickedColor.hex }}
                        />
                        <div
                          className="w-0.5 h-3 bg-white shadow mx-auto"
                          style={{ boxShadow: "0 0 2px rgba(0,0,0,0.6)" }}
                        />
                      </div>
                    )}

                  {loading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-700">{t("services.simulation.extracting")}</span>
                      </div>
                    )}

                    {/* تلميح بالضغط */}
                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
                      <div className="bg-black/65 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                          <path strokeLinecap="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
                        </svg>
                        {t("services.simulation.click_to_pick", { defaultValue: "اضغط على الصورة لاختيار لون" })}
                      </div>
                    </div>
                  </div>

                  {/* بطاقة اللون المختار يدوياً */}
                  {pickedColor && (
                    <div className="flex items-center gap-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm mt-1">
                      <div
                        className="w-14 h-14 rounded-2xl shrink-0 border-2 border-white shadow-lg ring-1 ring-black/10"
                        style={{ backgroundColor: pickedColor.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                          {t("services.simulation.picked_color", { defaultValue: "اللون المختار" })}
                        </p>
                        <p className="font-mono text-xl font-bold text-gray-900 tracking-tight">
                          {pickedColor.hex}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          rgb({pickedColor.r}, {pickedColor.g}, {pickedColor.b})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyPickedHex(pickedColor.hex)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 text-xs font-semibold shadow-sm transition-colors shrink-0"
                      >
                        {copiedPicked ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            {t("services.simulation.copied")}
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8V6a2 2 0 00-2-2h-2m-4 0h-2a2 2 0 00-2 2v8a2 2 0 002 2h2"/>
                            </svg>
                            {t("services.simulation.copy_hex")}
                          </>
                        )}
                      </button>
                </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" aria-hidden />
                {t("services.simulation.result_title", {
                    defaultValue: "الألوان المستخرجة",
                })}
              </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t("services.simulation.hex_copy_hint", { defaultValue: "انقر على الكود أو زر النسخ لنسخ قيمة HEX" })}
                </p>
              </div>
              {extractedColors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {extractedColors.map((item, i) => {
                    const displayHex = (item.hex || "").startsWith("#") ? item.hex : "#" + (item.hex || "");
                    const isCopied = copiedHexIndex === i;
                    return (
                      <div
                        key={i}
                        className="group relative bg-gray-50/80 border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl shrink-0 border-2 border-white shadow-md ring-1 ring-black/5 overflow-hidden"
                          style={{ backgroundColor: displayHex }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {item.title || ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-200/80 px-1.5 py-0.5 rounded uppercase">
                              HEX
                      </span>
                            <button
                              type="button"
                              onClick={() => copyExtractedHex(displayHex, i)}
                              className="font-mono text-base font-bold text-gray-900 tracking-tight hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded px-0.5 -ml-0.5 transition-colors"
                              title={t("services.simulation.click_to_copy")}
                            >
                              {displayHex.toUpperCase()}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => copyExtractedHex(displayHex, i)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 hover:text-blue-600 text-xs font-medium transition-colors"
                              title={t("services.simulation.copy_hex")}
                              aria-label={t("services.simulation.copy_hex")}
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8V6a2 2 0 00-2-2h-2m-4 0h-2a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                              </svg>
                              <span>{t("services.simulation.copy_hex")}</span>
                            </button>
                            {isCopied && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t("services.simulation.copied")}
                      </span>
                            )}
                          </div>
                    </div>
                  </div>
                    );
                  })}
                </div>
              ) : loading && previewUrl ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-500 border-2 border-dotted rounded-2xl bg-gray-50">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">{t("services.simulation.extracting")}</p>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400 border-2 border-dotted rounded-2xl bg-gray-50">
                  <p className="text-sm italic px-6 text-center">
                    {t("services.simulation.empty_state", {
                      defaultValue: "ارفع صورة لاستخراج 5 ألوان",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
