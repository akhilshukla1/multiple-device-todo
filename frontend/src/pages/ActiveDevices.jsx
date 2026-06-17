import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const ActiveDevices = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogoutAll = async () => {
    try {
      await api.delete("/user/logout-all");
      localStorage.removeItem("accessToken");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await api.get("/user/get-sessions");
      setSessions(res.data.sessions);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const logoutDevice = async (id) => {
    try {
      await api.delete(`/user/logoutDevice/${id}`);
      setSessions((prev) => {
        const updated = prev.filter((device) => device._id !== id);
        if (updated.length === 0) navigate("/", { replace: true });
        return updated;
      });
    } catch (err) {
      console.log(err);
    }
  };

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.current).length;
  const otherSessions = totalSessions - activeSessions;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-lg animate-pulse">
          Loading devices...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Active Devices</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage sessions across all your devices
          </p>
        </div>
        <button
          onClick={handleLogoutAll}
          className="text-white px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          Logout All
        </button>
      </div>

      {/* Stats Row */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-5 text-center">
          <h3 className="text-gray-500 font-medium mb-2">Total Sessions</h3>
          <p className="text-4xl font-bold text-indigo-600">{totalSessions}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 text-center">
          <h3 className="text-gray-500 font-medium mb-2">Active Now</h3>
          <p className="text-4xl font-bold text-green-500">{activeSessions}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 text-center">
          <h3 className="text-gray-500 font-medium mb-2">Other Devices</h3>
          <p className="text-4xl font-bold text-red-500">{otherSessions}</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Session Manager</h2>
            <p className="text-slate-400 text-sm mt-1">
              Review and revoke access from any device
            </p>
          </div>
        </div>

        {/* Devices List */}
        <div className="flex flex-col gap-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/40 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-slate-950 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                  💻
                </div>
                <div>
                  <p className="font-semibold text-slate-100">
                    {session.device}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Logged in on {new Date(session.createdAt).toLocaleString()}
                  </p>
                  {session.current && (
                    <span className="inline-block mt-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/25">
                      Current Device
                    </span>
                  )}
                </div>
              </div>

              {!session.current && (
                <button
                  onClick={() => logoutDevice(session._id)}
                  className="text-white px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Logout
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Divider + Security */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <h3 className="text-base font-semibold text-red-400 mb-1.5">
            🛡 Security Actions
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            This will sign you out from every device and browser immediately.
          </p>
          <button
            onClick={handleLogoutAll}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
          >
            Logout All Devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveDevices;
