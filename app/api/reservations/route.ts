import { NextResponse } from "next/server"; import { Pool } from "pg";
export const runtime="nodejs";
const pool = new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:undefined,max:3});
export async function POST(req:Request){
 try{
  if(!process.env.DATABASE_URL) return NextResponse.json({error:"Banco de dados ainda não configurado. Entre em contato pelo e-mail da locadora."},{status:503});
  const body=await req.json(); const {vehicleId,fullName,email,phone,pickupAt,returnAt}=body;
  if(!vehicleId||!fullName||!email||!phone||!pickupAt||!returnAt||new Date(returnAt)<=new Date(pickupAt)) return NextResponse.json({error:"Preencha todos os campos e confira as datas."},{status:400});
  const client=await pool.connect();
  try{
   await client.query("BEGIN");
   const vehicle=await client.query("SELECT id,daily_rate,available FROM vehicles WHERE id=$1 AND available=true",[vehicleId]);
   if(!vehicle.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Veículo indisponível no momento."},{status:409});}
   const customer=await client.query("INSERT INTO customers(full_name,email,phone) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name,phone=EXCLUDED.phone RETURNING id",[fullName,email.toLowerCase(),phone]);
   const days=Math.max(1,Math.ceil((new Date(returnAt).getTime()-new Date(pickupAt).getTime())/86400000));
   const total=(Number(vehicle.rows[0].daily_rate)*days).toFixed(2);
   const reservation=await client.query("INSERT INTO reservations(customer_id,vehicle_id,pickup_at,return_at,status,total_amount) VALUES($1,$2,$3,$4,'pending',$5) RETURNING id",[customer.rows[0].id,vehicleId,pickupAt,returnAt,total]);
   await client.query("COMMIT");
   return NextResponse.json({ok:true,reservationId:reservation.rows[0].id,totalAmount:total},{status:201});
  }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 }catch(error){console.error("reservation error",error);return NextResponse.json({error:"Não foi possível registrar a solicitação. Tente novamente mais tarde."},{status:500});}
}