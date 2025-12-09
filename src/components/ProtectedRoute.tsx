const ProtectedRoute = ({ children }: { children: React.ReactNode; adminOnly?: boolean }) => <>{children}</>;

export default ProtectedRoute;