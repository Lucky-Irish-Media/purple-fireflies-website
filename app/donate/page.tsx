export default function Donate() {
  const paymentMethods = [
    { name: "Venmo", image: "/qr-codes/venmo.png" },
    { name: "PayPal", image: "/qr-codes/paypal.png" },
    { name: "Cash App", image: "/qr-codes/cash_app.png" },
    { name: "Give Butter", image: "/qr-codes/give_butter.png" },
  ];

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <main className="flex flex-col items-center gap-12 px-4 py-32 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Donate
        </h1>
        <p className="text-lg leading-8 text-text-secondary">
          Support Purple Fireflies by making a donation. Every contribution helps us continue our mission.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {paymentMethods.map((method) => (
            <div key={method.name} className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">{method.name}</h2>
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
