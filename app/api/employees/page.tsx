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

  const [loading, setLoading] = useState(false);


  // 仮
  // 後でsessionから取得
  const storeToken =
    localStorage.getItem("storeToken");


  async function loadEmployees(){

    if(!storeToken) return;


    const res = await fetch(
      `/api/employees?storeToken=${storeToken}`
    );


    const data = await res.json();


    if(data.success){
      setEmployees(data.employees);
    }

  }



  useEffect(()=>{

    loadEmployees();

  },[]);



  async function addEmployee(){

    if(!name || !hourly){
      alert("入力してください");
      return;
    }


    setLoading(true);


    await fetch("/api/employees",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        storeToken,

        name,

        hourly:Number(hourly)

      })

    });


    setName("");
    setHourly("");

    await loadEmployees();

    setLoading(false);

  }



  async function deleteEmployee(id:string){

    await fetch("/api/employees",{

      method:"DELETE",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        storeToken,

        id

      })

    });


    loadEmployees();

  }



  return (

    <main className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">


        <h1 className="text-2xl font-bold mb-6">
          従業員管理
        </h1>



        <div className="space-y-3 mb-8">


          <input
            className="border p-2 w-full"
            placeholder="名前"
            value={name}
            onChange={
              e=>setName(e.target.value)
            }
          />


          <input
            className="border p-2 w-full"
            placeholder="時給"
            type="number"
            value={hourly}
            onChange={
              e=>setHourly(e.target.value)
            }
          />


          <button

            onClick={addEmployee}

            className="bg-blue-500 text-white px-4 py-2 rounded"

          >

            {loading ? "登録中..." : "追加"}

          </button>


        </div>




        <h2 className="font-bold mb-3">
          従業員一覧
        </h2>



        {employees.map(emp=>(

          <div
            key={emp.id}
            className="border p-3 mb-2 flex justify-between"
          >

            <div>

              <div>
                {emp.name}
              </div>

              <div>
                {emp.hourly}円
              </div>

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
