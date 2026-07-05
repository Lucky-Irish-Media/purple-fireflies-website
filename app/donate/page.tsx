export default function Donate() {
  const paymentMethods = [
    { name: "Venmo", image: "/qr-codes/venmo.png" },
    { name: "PayPal", image: "/qr-codes/paypal.png" },
    { name: "Cash App", image: "/qr-codes/cash_app.png" },
    { name: "Give Butter", image: "/qr-codes/give_butter.png" },
  ];

  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Support Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Donate
            </h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 480, margin: "0 auto" }}>
              Every contribution helps us continue our mission. Choose any method below to support Purple Fireflies.
            </p>
          </div>
        </div>
      </section>

      {/* QR codes */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex flex-col items-center gap-4 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(124,58,237,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <h2 className="text-lg font-bold text-foreground">{method.name}</h2>
                <div className="w-44 h-44">
                  <img
                    src={method.image}
                    alt={`${method.name} QR Code`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
