"use client";

import { useQuery } from "convex/react"
import { api } from "@workspace/backend/_generated/api"

export default function Page() {
  const users = useQuery(api.users.getUsers); 

  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <p>app/widget</p>
      <div className="max-w-sm w-full mx-auto">
        {JSON.stringify(users, null, 2)}
      </div>
    </div>
  )
}
