import { Link } from "react-router-dom";

export function AuthHeader() {
  return (
    <div className="text-center">
      <Link to="/" className="text-xl font-semibold">
        CommerceHub
      </Link>
    </div>
  );
}
