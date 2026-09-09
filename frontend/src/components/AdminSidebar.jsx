import {
  LayoutDashboard,
  Wrench,
  Tag,
  PenLine,
  MessageSquare,
  MessageSquareQuote,
  UserCog,
  Handshake,
  Settings,
  LogOut,
  X,
} from "lucide-react";

function AdminSidebar({
  currentPage = "",
  mobile = false,
  onClose,
  onLogout,
}) {
  const adminUsername =
    localStorage.getItem("adminUsername") ||
    "Admin";

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const handleNavigation = (
    event,
    path
  ) => {
    event.preventDefault();

    if (mobile && onClose) {
      onClose();
    }

    navigateTo(path);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#17213A] text-white">
      {/* =================================================
          BRAND
      ================================================== */}

      <div className="flex min-h-[76px] items-center border-b border-white/10 px-6">
        <div className="min-w-0">
          <p className="whitespace-nowrap text-xl font-bold tracking-tight text-white">
            Research
            <span className="text-slate-300">
              Guru
            </span>
          </p>

          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Administration
          </p>
        </div>

        {/* MOBILE CLOSE */}

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto cursor-pointer rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* =================================================
          NAVIGATION
      ================================================== */}

      <nav className="flex-1 space-y-1 px-4 py-6">
        <SidebarItem
          label="Dashboard"
          icon={<LayoutDashboard size={19} />}
          path="/admin"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
          label="Site Settings"
          icon={<Settings size={19} />}
          path="/admin/settings"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
          label="Admin Management"
          icon={<UserCog size={19} />}
          path="/admin/users"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
          label="Services"
          icon={<Wrench size={19} />}
          path="/admin/services"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
          label="Blog"
          icon={<PenLine size={19} />}
          path="/admin/blog"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
          label="Contact Enquiries"
          icon={<MessageSquare size={19} />}
          path="/admin/contact"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
            label="Reviews"
            icon={<MessageSquareQuote size={19} />}
            path="/admin/reviews"
            currentPage={currentPage}
            onNavigate={handleNavigation}
        />
        
        <SidebarItem
          label="Our Clients"
          icon={<Handshake size={19} />}
          path="/admin/clients"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

        <SidebarItem
          label="Offers"
          icon={<Tag size={19} />}
          path="/admin/offers"
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />

      </nav>

      {/* =================================================
          ACCOUNT
      ================================================== */}

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-xl bg-white/5 px-4 py-3">
          <p className="truncate text-sm font-semibold text-white">
            {adminUsername}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Administrator
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   SIDEBAR ITEM
===================================================== */

function SidebarItem({
  label,
  icon,
  path,
  currentPage,
  onNavigate,
}) {
  const isActive =
    currentPage === path;

  return (
    <a
      href={path}
      onClick={(event) =>
        onNavigate(event, path)
      }
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        isActive
          ? "bg-white/10 font-semibold text-white"
          : "font-medium text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}

      <span>{label}</span>
    </a>
  );
}

export default AdminSidebar;