"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserTable from "@/components/UserTable";

const queryClient = new QueryClient();

const Home = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
        <UserTable />
      </div>
    </QueryClientProvider>
  );
};

export default Home;
