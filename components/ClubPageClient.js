"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function ClubPageClient({ clubCode, clubName, userEmail, userName, userImage }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        fetch(`/api/students?clubCode=${clubCode}`),
        fetch(`/api/teachers?clubCode=${clubCode}`),
      ]);

      const sData = await sRes.json();
      const tData = await tRes.json();

      if (sData.success) setStudents(sData.data);
      if (tData.success) setTeachers(tData.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clubCode]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">

      {/* ───────── TOP BAR ───────── */}
      <div className="h-16 bg-[#0C2945] text-white flex items-center justify-between px-6 shadow">

        <div className="flex items-center gap-3">
          <NITLogo />
          <span className="font-semibold">{clubName}</span>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={userImage}
            alt="user"
            width={36}
            height={36}
            className="rounded-full"
          />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ───────── BODY ───────── */}
      <div className="flex flex-1">

        {/* ───────── SIDEBAR ───────── */}
        <div className="w-64 bg-white border-r p-5 space-y-3">

          <SidebarButton
            active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
            label="Students"
          />

          <SidebarButton
            active={activeTab === "faculty"}
            onClick={() => setActiveTab("faculty")}
            label="Faculty"
          />

          <SidebarButton
            active={false}
            disabled
            label="Events (Soon)"
          />
        </div>

        {/* ───────── MAIN CONTENT ───────── */}
        <div className="flex-1 p-6">

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-10 h-10 border-4 border-[#0C2945] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* STUDENTS */}
              {activeTab === "students" && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {students.map((s) => (
                    <div key={s._id} className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm">

                      {/* IMAGE */}
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                        {s.imageUrl ? (
                          <img src={s.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#0C2945]">
                            {s.name?.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* NAME */}
                      <div className="mt-3 text-sm font-semibold text-[#0C2945] text-center">
                        {s.name}
                      </div>

                      {/* ROLL / EMAIL */}
                      <div className="text-xs text-gray-400 text-center">
                        {s.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FACULTY */}
              {activeTab === "faculty" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teachers.map((t) => (
                    <div key={t._id} className="bg-white p-5 rounded-xl shadow flex items-center gap-4">

                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-[#0C2945]">
                        {t.email?.charAt(0)}
                      </div>

                      <div>
                        <div className="font-semibold text-[#0C2945]">
                          {t.name || "Faculty"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {t.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── COMPONENTS ───────── */

function SidebarButton({ label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition
        ${disabled
          ? "text-gray-300 cursor-not-allowed"
          : active
          ? "bg-[#0C2945] text-white"
          : "hover:bg-gray-100 text-gray-700"
        }`}
    >
      {label}
    </button>
  );
}

function NITLogo() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#B8872A] flex items-center justify-center text-white font-bold">
      NIT
    </div>
  );
}