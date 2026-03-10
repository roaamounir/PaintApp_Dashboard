import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const Services = () => {
  const { t } = useTranslation();
  const {
    calculatePaint,
    convertColorMatch,
    colorSystems,
    paints,
    colors,
    loading: contextLoading,
  } = useAppContext();

  // --- States ---
  const [activeTab, setActiveTab] = useState("calc");
  const [loading, setLoading] = useState(false);

  // Simulation States
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [matchedColor, setMatchedColor] = useState(null);
  const imageRef = useRef(null);

  // Calc & Convert States
  const [calcType, setCalcType] = useState("dimensions");
  const [calcInputs, setCalcInputs] = useState({});
  const [calcResult, setCalcResult] = useState(null);
  const [convertInputs, setConvertInputs] = useState({
    sourceColorId: "",
    targetSystemId: "",
  });
  const [convertResult, setConvertResult] = useState(null);

  const availableColors = colors || paints || [];

  // --- Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMatchedColor(null);
    }
  };

  const handleImageClick = async (e) => {
    if (!selectedImage || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x =
      ((e.clientX - rect.left) / rect.width) * imageRef.current.naturalWidth;
    const y =
      ((e.clientY - rect.top) / rect.height) * imageRef.current.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageRef.current, 0, 0);

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const hex =
      "#" +
      ((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2])
        .toString(16)
        .slice(1);

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/simulation/match",
        { hex: hex },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (res.data.success && res.data.data.length > 0) {
        setMatchedColor(res.data.data[0]);
      }
    } catch (err) {
      console.error("Simulation error:", err);
      alert(err.response?.data?.error || "Error matching color");
    } finally {
      setLoading(false);
    }
  };
  const handleCalculate = async () => {
    const res = await calculatePaint(calcInputs);
    if (res.success) setCalcResult(res.data);
  };

  const handleConvert = async () => {
    if (!convertInputs.sourceColorId || !convertInputs.targetSystemId) {
      alert(t("services.converter.alerts.select_both"));
      return;
    }

    setConvertResult(null);

    const payload = {
      sourceColorId: parseInt(convertInputs.sourceColorId),
      targetSystemId: parseInt(convertInputs.targetSystemId),
    };

    const res = await convertColorMatch(payload);
    if (res.success) {
      setConvertResult(res.data);
    } else {
      alert(res.error);
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
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
              <h4 className="text-blue-800 font-bold mb-1">
                {t("services.calculator.results.title")}
              </h4>
              <p className="text-gray-600">
                {t("services.calculator.results.total_area")}:{" "}
                <span className="font-semibold">{calcResult.area} m²</span>
              </p>
              <p className="text-2xl text-blue-900 mt-2">
                {t("services.calculator.results.recommended")}:{" "}
                <span className="font-black">
                  {calcResult.recommendedQuantity} {calcResult.unit}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Color Converter Content */}
      {activeTab === "converter" && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              {t("services.converter.header")}
            </h2>
            <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-medium">
              {t("services.converter.badge")}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("services.converter.fields.source_label")}
                </label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={convertInputs.sourceColorId}
                  onChange={(e) =>
                    setConvertInputs({
                      ...convertInputs,
                      sourceColorId: e.target.value,
                    })
                  }
                >
                  <option value="">
                    {t("services.converter.fields.source_placeholder")}
                  </option>
                  {availableColors?.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.code} - {color.name || "Color"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("services.converter.fields.target_label")}
                </label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={convertInputs.targetSystemId}
                  onChange={(e) =>
                    setConvertInputs({
                      ...convertInputs,
                      targetSystemId: e.target.value,
                    })
                  }
                >
                  <option value="">
                    {t("services.converter.fields.target_placeholder")}
                  </option>
                  {colorSystems?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={
                loading ||
                !convertInputs.sourceColorId ||
                !convertInputs.targetSystemId
              }
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all disabled:bg-gray-300"
            >
              {loading
                ? t("services.converter.actions.loading")
                : t("services.converter.actions.convert")}
            </button>
          </div>
          {convertResult && (
            <div className="mt-10 bg-[#151b28] text-white p-8 rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center relative">
                {/* 1. اللون الأصلي */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div
                      style={{
                        backgroundColor: convertResult?.originalColor?.hex,
                      }}
                      className="w-44 h-44 rounded-full border-4 border-[#1a1d23] shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-800 px-3 py-1 rounded text-[10px] font-mono border border-gray-700">
                      ORIGINAL
                    </div>
                  </div>
                  <div className="text-center font-mono">
                    <h3 className="text-xl font-bold tracking-tighter">
                      {convertResult?.originalColor?.code}
                    </h3>
                    <div className="text-[11px] text-gray-400 mt-2 space-y-1">
                      <p>
                        HEX: {convertResult?.originalColor?.hex.toUpperCase()}
                      </p>
                      <p>
                        LAB: {convertResult?.originalColor?.lab_l?.toFixed(1)},{" "}
                        {convertResult?.originalColor?.lab_a?.toFixed(1)},{" "}
                        {convertResult?.originalColor?.lab_b?.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. مؤشر المطابقة في المنتصف */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent absolute top-1/2 hidden md:block"></div>
                  <div className="bg-[#1a1d23] border border-gray-700 p-4 rounded-xl z-10 text-center min-w-[140px]">
                    <span className="text-3xl font-black text-blue-500 block">
                      {convertResult?.comparison?.matchPercentage}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                      Match Accuracy
                    </span>
                  </div>
                  <div className="z-10 bg-blue-600/10 text-blue-400 px-4 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                    {convertResult?.comparison?.differenceNote}
                  </div>
                </div>

                {/* 3. اللون المستهدف (أفضل تطابق) */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div
                      style={{
                        backgroundColor: convertResult?.matchedColor?.hex,
                      }}
                      className="w-44 h-44 rounded-full border-4 border-[#1a1d23] shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 px-3 py-1 rounded text-[10px] font-mono shadow-lg shadow-blue-900/40">
                      BEST MATCH
                    </div>
                  </div>
                  <div className="text-center font-mono">
                    <h3 className="text-xl font-bold tracking-tighter text-blue-400">
                      {convertResult?.matchedColor?.code}
                    </h3>
                    <div className="text-[11px] text-gray-400 mt-2 space-y-1">
                      <p>∆E: {convertResult?.comparison?.deltaE}</p>
                      <p>SYSTEM: {convertInputs.targetSystemId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* تفاصيل المختبر الإضافية في الأسفل */}
              <div className="mt-12 pt-6 border-t border-gray-800/50 flex justify-around text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <div className="flex flex-col items-center">
                  <span className="text-gray-300 mb-1">Status</span> Ready
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300 mb-1">Algorithm</span> Delta-E
                  76
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300 mb-1">Precision</span> High
                </div>
              </div>
            </div>
          )}
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
                <div className="relative border-4 border-white shadow-xl rounded-lg overflow-hidden cursor-crosshair group">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Preview"
                    onClick={handleImageClick}
                    className="w-full h-auto"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                      {t("services.simulation.click_hint", {
                        defaultValue: "انقر على أي مكان في الصورة",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {t("services.simulation.result_title", {
                  defaultValue: "نتيجة المطابقة",
                })}
              </h3>
              {matchedColor ? (
                <div className="p-5 bg-white border border-blue-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-right duration-500">
                  <div
                    className="w-full h-32 rounded-xl mb-4 shadow-inner border border-gray-100"
                    style={{ backgroundColor: matchedColor.hex }}
                  ></div>
                  <div className="space-y-3">
                    <p className="text-2xl font-black text-gray-800">
                      {matchedColor.name_ar || matchedColor.name_en}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-gray-600 border border-gray-200">
                        {matchedColor.code}
                      </span>
                      <span className="text-blue-600 font-bold">
                        {matchedColor.matchPercentage}%{" "}
                        {t("services.converter.results.match_label")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dotted rounded-2xl bg-gray-50">
                  <p className="text-sm italic px-6 text-center">
                    {t("services.simulation.empty_state", {
                      defaultValue: "ارفع صورة واضغط عليها",
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
