import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Ruler,
  Paintbrush,
  Star,
  Briefcase,
  Edit3,
  Save,
  X,
} from "lucide-react";

const VisitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { visits, painters, updateVisit, updateVisitStatus } = useAppContext();

  const [visit, setVisit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const foundVisit = visits.find((v) => v.id === Number(id));
    if (foundVisit) {
      setVisit(foundVisit);
      setEditData({ ...foundVisit });
    }
  }, [id, visits]);

  const handleSave = async () => {
    const result = await updateVisit(id, editData);
    if (result.success) {
      setIsEditing(false);
      alert("Visit updated successfully ✅");
    } else {
      alert("Update failed: " + result.error);
    }
  };

  if (!visit || !editData)
    return (
      <div className="p-20 text-center font-bold text-slate-400 animate-pulse">
        Loading visit details...
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen font-sans">
      {/* ================= TOP BAR ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-2"
          >
            <ArrowLeft size={18} />
            Back to Visits
          </button>

          <h1 className="text-3xl font-black text-slate-800">
            Visit Details{" "}
            <span className="text-blue-600">
              #{visit.id.toString().slice(-5)}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 shadow-lg"
              >
                <Save size={18} />
                Save
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ ...visit });
                }}
                className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"
              >
                <Edit3 size={18} />
                Edit
              </button>

              <select
                value={visit.status}
                onChange={(e) => updateVisitStatus(visit.id, e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-4 py-3 font-bold text-blue-600"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* -------- Customer Info -------- */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Customer Information" icon={<User />}>
            <DetailRow
              label="Full Name"
              value={visit.user?.name}
              icon={<User size={16} />}
            />
            <DetailRow
              label="Phone"
              value={visit.user?.phone}
              icon={<Phone size={16} />}
            />
            <DetailRow
              label="Location"
              value={`${visit.city} - ${visit.region}`}
              icon={<MapPin size={16} />}
            />
          </Card>

          <Card dark title="Address Details" icon={<MapPin />}>
            <InfoBox label="City" value={visit.city} />
            <InfoBox label="Region" value={visit.region} />
          </Card>
        </div>

        {/* -------- Visit Info -------- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox
              icon={<Calendar />}
              label="Visit Date"
              isEditing={isEditing}
              editElement={
                <input
                  type="date"
                  value={editData.visitDate?.split("T")[0]}
                  onChange={(e) =>
                    setEditData({ ...editData, visitDate: e.target.value })
                  }
                  className="input"
                />
              }
              value={new Date(visit.visitDate).toLocaleDateString()}
              color="blue"
            />

            <StatBox
              icon={<Ruler />}
              label="Area (m²)"
              isEditing={isEditing}
              editElement={
                <input
                  type="number"
                  value={editData.area}
                  onChange={(e) =>
                    setEditData({ ...editData, area: e.target.value })
                  }
                  className="input"
                />
              }
              value={`${visit.area} m²`}
              color="orange"
            />

            <StatBox
              icon={<Clock />}
              label="Time Slot"
              isEditing={isEditing}
              editElement={
                <select
                  value={editData.visitTime}
                  onChange={(e) =>
                    setEditData({ ...editData, visitTime: e.target.value })
                  }
                  className="input"
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              }
              value={visit.visitTime || "Not Set"}
              color="purple"
            />
          </div>

          {/* -------- Painter -------- */}
          <Card title="Assigned Painter" icon={<Paintbrush />}>
            {isEditing ? (
              <select
                value={editData.painterId}
                onChange={(e) => {
                  const painter = painters.find(
                    (p) => p.id === Number(e.target.value),
                  );
                  setEditData({
                    ...editData,
                    painterId: Number(e.target.value),
                    painter,
                  });
                }}
                className="input mb-4"
              >
                {painters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user.name} - {p.city}
                  </option>
                ))}
              </select>
            ) : (
              <h4 className="text-2xl font-black text-slate-800">
                {visit.painter?.user?.name || "Not Assigned"}
              </h4>
            )}

            <div className="flex gap-4 mt-4 flex-wrap">
              <Badge
                text={`${visit.painter?.rating || 0} Rating`}
                icon={<Star size={14} />}
              />
              <Badge
                text={`${visit.painter?.experience || 0} Years Experience`}
                icon={<Briefcase size={14} />}
              />
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE UI ================= */

const Card = ({ title, icon, children, dark }) => (
  <div
    className={`rounded-3xl p-8 shadow-sm ${
      dark ? "bg-slate-900 text-white" : "bg-white border border-slate-100"
    }`}
  >
    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const DetailRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 mb-5">
    <div className="p-3 bg-slate-100 rounded-xl">{icon}</div>
    <div>
      <p className="text-xs text-slate-400 font-bold">{label}</p>
      <p className="font-bold text-slate-700">{value || "N/A"}</p>
    </div>
  </div>
);

const InfoBox = ({ label, value }) => (
  <div className="bg-slate-800/60 p-4 rounded-xl mb-4">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

const StatBox = ({ icon, label, value, color, isEditing, editElement }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div className={`p-6 rounded-3xl border ${colors[color]}`}>
      {React.cloneElement(icon, { size: 26 })}
      <p className="text-xs mt-3 font-bold opacity-70">{label}</p>
      <div className="mt-2">
        {isEditing ? (
          editElement
        ) : (
          <p className="text-lg font-black">{value}</p>
        )}
      </div>
    </div>
  );
};

const Badge = ({ icon, text }) => (
  <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600">
    {icon} {text}
  </div>
);

export default VisitDetails;
