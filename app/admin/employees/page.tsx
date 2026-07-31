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

  const [storeToken, setStoreToken] = useState("");

  const [name, setName] = useState("");
  const [hourly, setHourly] = useState("");

  const [loading, setLoading] = useState(false);



  // ===========================
  // 初期処理
  // ===========================
  useEffect(() => {

    const token =
      window.localStorage.getItem("storeToken");


    if (!token) {

      console.error("storeTokenなし");
      return;

    }


    setStoreToken(token);

    loadEmployees(token);


  }, []);




  // ===========================
  // 従業員取得
  // ===========================
  async function loadEmployees(token:string) {

    try {

      const res =
        await fetch(
          `/api/employees?storeToken=${token}`
        );


      const data =
        await res.json();


      if(data.success){

        setEmployees(data.employees);

      }


    } catch(error){

      console.error(error);

    }

  }




  // ===========================
  // 追加
  // ===========================
  async function addEmployee(){

    if(!storeToken){

      alert("店舗情報がありません");
      return;

    }


    if(!name || !hourly){

      alert("名前と時給を入力してください");
      return;

    }


    setLoading(true);


    try{


      const res =
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



      const data =
        await res.json();



      if(!data.success){

        alert(data.error);
        return;

      }



      setName("");
      setHourly("");

      loadEmployees(storeToken);



    }catch(error){

      console.error(error);

      alert("追加失敗");


    }finally{

      setLoading(false);

    }

  }





  // ===========================
  // 削除
  // ===========================
  async function deleteEmployee(id:string){


    if(!storeToken) return;



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



    loadEmployees(storeToken);


  }





  return (

    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">


        <h1 className="text-2xl font-bold mb-6">
          従業員管理
        </h1>



        <div className="space-y-3">


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

            disabled={loading}

            className="bg-blue-500 text-white px-4 py-2 rounded"

          >

            {loading ? "登録中..." : "追加"}

          </button>


        </div>




        <hr className="my-6"/>



        <h2 className="font-bold mb-3">
          従業員一覧
        </h2>



        {employees.map((employee)=>(


          <div

            key={employee.id}

            className="border rounded p-3 mb-2 flex justify-between"

          >


            <div>

              <div>
                {employee.name}
              </div>


              <div className="text-sm text-gray-500">

                時給 {employee.hourly}円

              </div>


            </div>



            <button

              onClick={
                ()=>deleteEmployee(employee.id)
              }

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
