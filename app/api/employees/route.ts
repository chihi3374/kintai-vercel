"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  status: string;
  hourly: number;
};

export default function EmployeesPage() {

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [hourly, setHourly] = useState("");
  const [storeToken, setStoreToken] = useState("");

  const [loading, setLoading] = useState(false);


  // ブラウザ側でのみ実行
  useEffect(() => {

    const token = localStorage.getItem("storeToken");

    if (token) {
      setStoreToken(token);
      loadEmployees(token);
    }

  }, []);



  async function loadEmployees(token: string) {

    const res = await fetch(
      `/api/employees?storeToken=${token}`
    );

    const data = await res.json();

    if (data.success) {
      setEmployees(data.employees);
    }

  }



  async function addEmployee() {

    if (!storeToken) {
      alert("店舗情報がありません");
      return;
    }


    if (!name || !hourly) {
      alert("名前と時給を入力してください");
      return;
    }


    setLoading(true);


    const res = await fetch("/api/employees", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        storeToken,
        name,
        hourly: Number(hourly)

      })

    });


    const data = await res.json();


    if (!data.success) {
      alert(data.error);
      setLoading(false);
      return;
    }


    setName("");
    setHourly("");

    await loadEmployees(storeToken);

    setLoading(false);

  }



  async function deleteEmployee(id:string) {

    await fetch("/api/employees", {

      method:"DELETE",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        storeToken,
        id
      })

    });


    loadEmployees(storeToken);

  }



  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">

        <h1 className="text-2xl font-bold mb-6">
          従業員管理
        </h1>


        <input
          className="border p-2 w-full mb-3"
          placeholder="名前"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />


        <input
          className="border p-2 w-full mb-3"
          placeholder="時給"
          type="number"
          value={hourly}
          onChange={(e)=>setHourly(e.target.value)}
        />


        <button
          onClick={addEmployee}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "登録中..." : "追加"}
        </button>


        <hr className="my-6"/>


        {employees.map((emp)=>(

          <div
            key={emp.id}
            className="border p-3 mb-2 flex justify-between"
          >

            <div>
              <div>{emp.name}</div>
              <div>{emp.hourly}円</div>
            </div>


            <button
              onClick={()=>deleteEmployee(emp.id)}
              className="text-red-500"
            >
              削除
            </button>

          </div>

        ))}

      </div>

    </main>
  );
}
