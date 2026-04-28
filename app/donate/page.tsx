export default function Donate() {
  const paymentMethods = [
    { name: "Venmo", image: "/qr-codes/venmo.png" },
    { name: "PayPal", image: "/qr-codes/paypal.png" },
    { name: "Cash App", image: "/qr-codes/cash_app.png" },
    { name: "Give Butter", image: "/qr-codes/give_butter.png" },
  ];

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-12 px-4 py-32 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Donate
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Support Purple Fireflies by making a donation. Every contribution helps us continue our mission.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {paymentMethods.map((method) => (
            <div key={method.name} className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{method.name}</h2>
              <div className="w-48 h-48 relative">
                <img
                  src={method.image}
                  alt={`${method.name} QR Code`}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
