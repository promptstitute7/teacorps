export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white">
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold text-gold">Teacorps Hotel</div>
        <p className="text-gray-400">Scan your room QR code to get started</p>
        <div className="flex gap-4 justify-center mt-8">
          <a href="/staff/login" className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm hover:border-gold transition-colors">
            Staff Login
          </a>
          <a href="/admin/login" className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm hover:border-gold transition-colors">
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
