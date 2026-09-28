import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./api";

/* ---------------------------------------------------------------------
   GUARD HOOK: Only allow a page to open if the correct role is
   logged in. Otherwise send back to the login page.
   --------------------------------------------------------------------- */
export function useRequireRole(role) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== role) {
      navigate("/");
      return;
    }
    setUser(currentUser);
  }, [role, navigate]);

  return user;
}
