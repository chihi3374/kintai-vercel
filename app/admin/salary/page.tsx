"use client";

import { useEffect, useState } from "react";

type SalaryResult = {
  id: string;
  name: string;
  hourly: number;
  hours: number;
  salary: number;
};


export default function SalaryPage() {

  const [storeToken, setStoreToken] = useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [results, setResults] =
    useState<SalaryResult[]>([]);

  const [loading, setLoading] =
    useState(false);



  // ===========================
  // storeToken取得
  // ===========================
  useEffect(()=>{

    const token =
      localStorage.getItem("storeToken");


    if(token){

      setStoreToken(token);

    }

  },[]);




  // ===========================
  // 給与計算
  // ===========================
  async function calculateSalary(){


    if(!storeToken){

      alert("店舗情報がありません");
      return;

    }


    if(!startDate || !endDate){

      alert("期間を選択してください");
      return;

    }



    setLoading(true);


    try{


      const res =
        await fetch("/api/salary",{

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            storeToken,

            startDate,

            endDate

          })

        });



      const data =
        await res.json();



      if(!data.success){

        alert(data.error);
        return;

      }



      setResults(data.results);



    }catch(error){

      console.error(error);

      alert("給与計算エラー");


    }finally{

      setLoading(false);

    }

  }





  return (

    <main className="min-h-screen bg-gray-100 p-6">


      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">


        <h1 className="text-2xl font-bold mb-6">
          給与計算
        </h1>



        <div className="space-y-3">


          <div>

            <label>
              開始日
            </label>

            <input

              type="date"

              className="border p-2 w-full"

              value={startDate}

              onChange={
                e=>setStartDate(e.target.value)
              }

            />

          </div>




          <div>

            <label>
              終了日
            </label>


            <input

              type="date"

              className="border p-2 w-full"

              value={endDate}

              onChange={
                e=>setEndDate(e.target.value)
              }

            />

          </div>




          <button

            onClick={calculateSalary}

            disabled={loading}

            className="
              bg-blue-500
              text-white
              px-5
              py-2
              rounded
            "

          >

            {loading
              ? "計算中..."
              : "給与計算"}

          </button>


        </div>





        <hr className="my-6"/>




        <h2 className="font-bold mb-3">
          結果
        </h2>




        {results.map((item)=>(

          <div

            key={item.id}

            className="
              border
              rounded
              p-4
              mb-3
            "

          >

            <div className="font-bold">

              {item.name}

            </div>


            <div>

              勤務時間：
              {item.hours}時間

            </div>


            <div>

              時給：
              {item.hourly}円

            </div>


            <div className="text-lg font-bold">

              給与：
              {item.salary.toLocaleString()}円

            </div>


          </div>

        ))}


      </div>


    </main>

  );

}
