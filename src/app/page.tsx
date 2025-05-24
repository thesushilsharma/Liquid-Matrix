export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center sm:text-left">
          Liquid Matrix
        </h1>
        <p className="text-xl text-center sm:text-left">
          Liquid Matrix is a robust order book system that simulates real world financial market dynamics with institutional-grade accuracy.
        </p>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
       Sushil Sharma
      </footer>
    </div>
  );
}
