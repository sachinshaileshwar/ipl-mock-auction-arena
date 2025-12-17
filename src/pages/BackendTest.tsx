import { useEffect, useState } from "react";
import api from "@/lib/api";

const BackendTest = () => {
  const [status, setStatus] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/api/health")
      .then((res) => {
        setStatus(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setError("Backend not reachable");
      });
  }, []);

  if (error) {
    return (
      <div className="p-6 text-red-500 font-semibold">
        ❌ {error}
      </div>
    );
  }

  return (
    <div className="p-6 text-green-600 font-semibold">
      ✅ Backend says: {status}
    </div>
  );
};

export default BackendTest;
