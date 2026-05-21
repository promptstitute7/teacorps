export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>Hotel Tea Square</div>
        <p className="text-on-surface-variant text-sm">Scan your room QR code to get started</p>
        <div className="flex gap-4 justify-center mt-8">
          <a href="/staff/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 bg-white hover:bg-primary/5 transition-colors">
            Staff Login
          </a>
          <a href="/admin/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-secondary border border-secondary/30 bg-white hover:bg-secondary/5 transition-colors">
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
