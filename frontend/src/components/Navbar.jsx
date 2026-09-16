import {
  BookOpen,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  apiFetch,
  API_URL,
} from "../utils/api";


function Navbar({
  showLiveOfferBar = false,
}) {
  const location = useLocation();


  /* =====================================================
     NAVBAR STATE
  ===================================================== */

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [showNavbar, setShowNavbar] =
    useState(true);

  const lastScrollYRef =
    useRef(
      typeof window !== "undefined"
        ? window.scrollY
        : 0
    );


  /* =====================================================
     SITE SETTINGS
  ===================================================== */

  const [siteName, setSiteName] =
    useState("Research Guru");

  const [logoUrl, setLogoUrl] =
    useState("");

  const [hasLiveOffer, setHasLiveOffer] =
    useState(false);


  /* =====================================================
     THEME
  ===================================================== */

  const [darkMode, setDarkMode] =
    useState(() => {
      if (
        typeof window === "undefined"
      ) {
        return false;
      }

      return (
        localStorage.getItem(
          "theme"
        ) === "dark"
      );
    });


  /* =====================================================
     BULB
  ===================================================== */

  const bulbRef =
    useRef(null);

  const [bulbBroken, setBulbBroken] =
    useState(false);

  const [bulbClicks, setBulbClicks] =
    useState(0);

  /*
   * Initial bulb position.
   *
   * Starts nicely inside the right side
   * instead of touching the edge.
   */
  const [bulbX, setBulbX] =
    useState(() => {
      if (
        typeof window === "undefined"
      ) {
        return 300;
      }

      return Math.max(
        92,
        window.innerWidth - 170
      );
    });

  const bulbTimerRef =
    useRef(null);


  /* =====================================================
     DRAG REFS
  ===================================================== */

  const isDragging =
    useRef(false);

  const hasMoved =
    useRef(false);

  const dragStartX =
    useRef(0);

  const dragStartBulbX =
    useRef(0);

  const suppressClick =
    useRef(false);


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Services",
      path: "/services",
    },
    {
      name: "Offers",
      path: "/offers",
    },
    {
      name: "Contact",
      path: "/contact",
    },
  ];


  /* =====================================================
     APPLY THEME
  ===================================================== */

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode
        ? "dark"
        : "light"
    );
  }, [
    darkMode,
  ]);


  /* =====================================================
     CLEAN BULB TIMER
  ===================================================== */

  useEffect(() => {
    return () => {
      if (
        bulbTimerRef.current
      ) {
        clearTimeout(
          bulbTimerRef.current
        );
      }
    };
  }, []);


  /* =====================================================
     BULB CLICK
  ===================================================== */

  function handleBulbClick() {
    /*
     * Ignore click caused by dragging.
     */
    if (
      suppressClick.current
    ) {
      suppressClick.current =
        false;

      return;
    }


    /*
     * Broken bulb cannot
     * be clicked anymore.
     */
    if (
      bulbBroken
    ) {
      return;
    }


    /*
     * Increase click count.
     */
    const nextClicks =
      bulbClicks + 1;

    setBulbClicks(
      nextClicks
    );


    /*
     * Toggle theme.
     */
    setDarkMode(
      previous =>
        !previous
    );


    /*
     * Five clicks within
     * five seconds = broken bulb.
     */
    if (
      nextClicks >= 5
    ) {
      setBulbBroken(
        true
      );

      setDarkMode(
        true
      );

      setBulbClicks(
        0
      );


      if (
        bulbTimerRef.current
      ) {
        clearTimeout(
          bulbTimerRef.current
        );
      }

      return;
    }


    /*
     * Restart the five-second
     * click window.
     */
    if (
      bulbTimerRef.current
    ) {
      clearTimeout(
        bulbTimerRef.current
      );
    }


    bulbTimerRef.current =
      setTimeout(() => {
        setBulbClicks(
          0
        );
      }, 5000);
  }


  /* =====================================================
     BULB DRAG START
  ===================================================== */

  function handleBulbPointerDown(
    event
  ) {
    /*
     * Only left mouse button.
     */
    if (
      event.pointerType ===
        "mouse" &&
      event.button !== 0
    ) {
      return;
    }


    isDragging.current =
      true;

    hasMoved.current =
      false;

    dragStartX.current =
      event.clientX;

    dragStartBulbX.current =
      bulbX;


    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );
  }


  /* =====================================================
     BULB DRAG MOVE
  ===================================================== */

  function handleBulbPointerMove(
    event
  ) {
    if (
      !isDragging.current
    ) {
      return;
    }


    const difference =
      event.clientX -
      dragStartX.current;


    /*
     * More than 4px = drag.
     */
    if (
      Math.abs(
        difference
      ) > 4
    ) {
      hasMoved.current =
        true;
    }


    /*
     * Allow the bulb to move
     * very close to both edges.
     *
     * The bulb itself is about
     * 82px wide, so 41px keeps
     * the visible bulb inside
     * the viewport.
     */
    const minX = 41;

    const maxX =
      window.innerWidth -
      41;


    const safeMaxX =
      Math.max(
        minX,
        maxX
      );


    const nextX =
      Math.min(
        Math.max(
          dragStartBulbX.current +
            difference,
          minX
        ),
        safeMaxX
      );


    setBulbX(
      nextX
    );
  }


  /* =====================================================
     BULB DRAG END
  ===================================================== */

  function handleBulbPointerUp(
    event
  ) {
    if (
      !isDragging.current
    ) {
      return;
    }


    isDragging.current =
      false;


    /*
     * Prevent release from
     * triggering bulb click.
     */
    if (
      hasMoved.current
    ) {
      suppressClick.current =
        true;
    }


    event.currentTarget.releasePointerCapture?.(
      event.pointerId
    );
  }


  /* =====================================================
     KEEP BULB INSIDE SCREEN
  ===================================================== */

  useEffect(() => {
    function handleResize() {
      /*
       * Same 41px edge limit
       * used by dragging.
       */
      const minX = 41;

      const maxX =
        window.innerWidth -
        41;

      const safeMaxX =
        Math.max(
          minX,
          maxX
        );


      setBulbX(
        currentX =>
          Math.min(
            Math.max(
              currentX,
              minX
            ),
            safeMaxX
          )
      );
    }


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);


  /* =====================================================
     LOAD SITE SETTINGS
  ===================================================== */

  useEffect(() => {
    let cancelled =
      false;


    async function loadSiteSettings() {
      try {
        const response =
          await apiFetch(
            "/api/site-settings"
          );


        if (
          !response.ok
        ) {
          return;
        }


        const data =
          await response.json();


        if (
          cancelled
        ) {
          return;
        }


        setSiteName(
          data.site_name ||
            "Research Guru"
        );


        setLogoUrl(
          data.logo_url ||
            ""
        );


        /*
         * FAVICON
         */
        if (
          data.favicon_url
        ) {
          const faviconHref =
            data.favicon_url.startsWith(
              "http://"
            ) ||
            data.favicon_url.startsWith(
              "https://"
            )
              ? data.favicon_url
              : `${API_URL}${data.favicon_url}`;


          let favicon =
            document.querySelector(
              'link[rel="icon"]'
            );


          if (!favicon) {
            favicon =
              document.createElement(
                "link"
              );

            favicon.rel =
              "icon";

            document.head.appendChild(
              favicon
            );
          }


          favicon.href =
            faviconHref;
        }
      } catch (
        error
      ) {
        console.error(
          "Failed to load site settings:",
          error
        );
      }
    }


    loadSiteSettings();


    return () => {
      cancelled =
        true;
    };
  }, []);


  /* =====================================================
     CHECK LIVE OFFERS
  ===================================================== */

  useEffect(() => {
    let cancelled =
      false;


    async function checkLiveOffer() {
      try {
        const response =
          await apiFetch(
            "/api/offers"
          );


        if (
          !response.ok
        ) {
          if (
            !cancelled
          ) {
            setHasLiveOffer(
              false
            );
          }

          return;
        }


        const offers =
          await response.json();


        if (
          !Array.isArray(
            offers
          )
        ) {
          if (
            !cancelled
          ) {
            setHasLiveOffer(
              false
            );
          }

          return;
        }


        const now =
          new Date();


        const liveOffer =
          offers.some(
            offer => {
              if (
                !offer.start_date ||
                !offer.end_date
              ) {
                return false;
              }


              const start =
                new Date(
                  offer.start_date
                );

              const end =
                new Date(
                  offer.end_date
                );


              if (
                Number.isNaN(
                  start.getTime()
                ) ||
                Number.isNaN(
                  end.getTime()
                )
              ) {
                return false;
              }


              return (
                now >= start &&
                now <= end
              );
            }
          );


        if (
          !cancelled
        ) {
          setHasLiveOffer(
            liveOffer
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Failed to check live offers:",
          error
        );


        if (
          !cancelled
        ) {
          setHasLiveOffer(
            false
          );
        }
      }
    }


    checkLiveOffer();


    const interval =
      setInterval(
        checkLiveOffer,
        60000
      );


    return () => {
      cancelled =
        true;

      clearInterval(
        interval
      );
    };
  }, []);


  /* =====================================================
     NAVBAR SCROLL
  ===================================================== */

  useEffect(() => {
    function handleScroll() {
      const currentScrollY =
        window.scrollY;


      const previousScrollY =
        lastScrollYRef.current;


      /*
       * Always show at the top.
       */
      if (
        currentScrollY <= 10
      ) {
        setShowNavbar(
          true
        );
      }


      /*
       * Scrolling DOWN.
       */
      else if (
        currentScrollY >
        previousScrollY
      ) {
        setShowNavbar(
          false
        );

        setMenuOpen(
          false
        );
      }


      /*
       * Scrolling UP.
       */
      else if (
        currentScrollY <
        previousScrollY
      ) {
        setShowNavbar(
          true
        );
      }


      lastScrollYRef.current =
        currentScrollY;
    }


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  /* =====================================================
     LOGO URL
  ===================================================== */

  function getLogoUrl() {
    if (
      !logoUrl
    ) {
      return "";
    }


    if (
      logoUrl.startsWith(
        "http://"
      ) ||
      logoUrl.startsWith(
        "https://"
      )
    ) {
      return logoUrl;
    }


    return `${API_URL}${logoUrl}`;
  }


  /* =====================================================
     NAV ITEM STYLE
  ===================================================== */

  function getNavItemTextClass(
    item,
    active
  ) {
    /*
     * Live offer gets green
     * pulsing treatment.
     */
    if (
      item.name ===
        "Offers" &&
      hasLiveOffer
    ) {
      return `
        font-bold
        text-emerald-500
        animate-pulse
      `;
    }


    /*
     * Active page.
     */
    if (
      active
    ) {
      return `
        font-semibold
        text-[#17213A]
        dark:text-white
      `;
    }


    /*
     * Normal page.
     */
    return `
      text-slate-600
      hover:text-[#17213A]

      dark:text-slate-300
      dark:hover:text-white
    `;
  }


  /* =====================================================
     HANGING BULB
  ===================================================== */

  const themeToggle = (
    <div
      className={`
        pointer-events-none

        absolute
        left-0
        top-full

        z-[200]

        hidden
        h-[350px]
        w-full

        sm:block

        /*
         * SLOWER BULB HIDE/SHOW
         */
        transition-all
        duration-[650ms]
        ease-in-out

        ${
          showNavbar
            ? "translate-y-0 opacity-100"
            : "-translate-y-[400px] opacity-0"
        }
      `}
    >

      {/* BULB ASSEMBLY */}

      <div
        ref={bulbRef}
        className="
          group

          pointer-events-none

          absolute
          top-0

          flex
          w-[184px]
          -translate-x-1/2
          flex-col
          items-center

          bulb-hanging-animation
        "
        style={{
          left: `${bulbX}px`,
        }}
      >

        {/* =============================================
            WIRE
        ============================================== */}

        <div
          className="
            h-[92px]
            w-[3px]
            shrink-0
            rounded-full
            bg-slate-700
            dark:bg-slate-400
          "
        />


        {/* =============================================
            BULB BUTTON
        ============================================== */}

        <button
          type="button"

          onPointerDown={
            handleBulbPointerDown
          }

          onPointerMove={
            handleBulbPointerMove
          }

          onPointerUp={
            handleBulbPointerUp
          }

          onPointerCancel={
            handleBulbPointerUp
          }

          onClick={
            handleBulbClick
          }

          aria-label={
            bulbBroken
              ? "Bulb broken"
              : "Toggle light"
          }

          className="
            pointer-events-auto

            relative

            min-h-[170px]
            min-w-[82px]

            flex
            cursor-grab

            touch-none
            select-none

            flex-col
            items-center

            border-0
            bg-transparent
            p-0

            outline-none

            active:cursor-grabbing
          "
        >

          {!bulbBroken && (
            <>

              {/* =======================================
                  SOCKET
              ======================================== */}

              <div
                className="
                  relative
                  z-20

                  h-[52px]
                  w-[58px]

                  overflow-hidden

                  rounded-[12px]

                  bg-gradient-to-b
                  from-slate-500
                  via-slate-900
                  to-slate-700

                  shadow-[0_8px_20px_rgba(0,0,0,0.35)]
                "
              >

                {/* TOP SHINE */}

                <div
                  className="
                    absolute
                    inset-x-0
                    top-0

                    h-[8px]

                    bg-gradient-to-b
                    from-white/25
                    to-transparent
                  "
                />


                {/* SCREW GROOVES */}

                <span
                  className="
                    absolute
                    left-0
                    top-[10px]

                    h-[3px]
                    w-full

                    bg-slate-400/70
                  "
                />

                <span
                  className="
                    absolute
                    left-0
                    top-[20px]

                    h-[3px]
                    w-full

                    bg-slate-400/70
                  "
                />

                <span
                  className="
                    absolute
                    left-0
                    top-[30px]

                    h-[3px]
                    w-full

                    bg-slate-400/70
                  "
                />

                <span
                  className="
                    absolute
                    left-0
                    top-[40px]

                    h-[3px]
                    w-full

                    bg-slate-400/70
                  "
                />

              </div>


              {/* =======================================
                  LIGHT GLOW
              ======================================== */}

              <div
                className={`
                  pointer-events-none

                  absolute
                  top-[25px]

                  h-[180px]
                  w-[180px]

                  rounded-full

                  bg-yellow-300

                  blur-3xl

                  transition-all
                  duration-700

                  ${
                    darkMode
                      ? `
                        scale-50
                        opacity-0
                      `
                      : `
                        scale-100
                        opacity-70
                      `
                  }
                `}
              />


              {/* =======================================
                  BULB GLASS
              ======================================== */}

              <div
                className={`
                  relative

                  -mt-[1px]

                  h-[118px]
                  w-[82px]

                  overflow-hidden

                  rounded-t-[48%]
                  rounded-b-[52%]

                  border
                  border-white/80

                  bg-gradient-to-b
                  from-white/60
                  via-yellow-100/80
                  to-yellow-200/40

                  backdrop-blur-[2px]

                  transition-all
                  duration-700

                  ${
                    darkMode
                      ? `
                        scale-[0.88]
                        opacity-35
                        shadow-none
                      `
                      : `
                        scale-100
                        opacity-100
                        shadow-[0_0_35px_12px_rgba(250,204,21,0.28)]
                      `
                  }
                `}
              >

                {/* GLASS HIGHLIGHT */}

                <div
                  className="
                    pointer-events-none

                    absolute

                    left-[12px]
                    top-[12px]

                    h-[75px]
                    w-[10px]

                    rotate-[8deg]

                    rounded-full

                    bg-white/50

                    blur-sm
                  "
                />


                {/* U-SHAPED FILAMENT */}

                <div
                  className={`
                    absolute

                    left-1/2
                    top-1/2

                    h-[55px]
                    w-[42px]

                    -translate-x-1/2
                    -translate-y-1/2

                    transition-opacity
                    duration-500

                    ${
                      darkMode
                        ? "opacity-20"
                        : "opacity-100"
                    }
                  `}
                >

                  <div
                    className="
                      absolute

                      bottom-[3px]
                      left-1/2

                      h-[38px]
                      w-[36px]

                      -translate-x-1/2

                      rounded-b-[50%]

                      border-b-[3px]
                      border-l-[3px]
                      border-r-[3px]

                      border-yellow-600

                      shadow-[0_0_8px_rgba(234,179,8,0.9)]
                    "
                  />

                </div>

              </div>

            </>
          )}


          {/* =============================================
              BROKEN GLASS
          ============================================== */}

          {bulbBroken && (
            <div
              className="
                pointer-events-none

                absolute

                left-1/2
                top-[15px]

                h-[190px]
                w-[210px]

                -translate-x-1/2
              "
            >

              {/* SHARD 1 */}

              <span
                className="
                  absolute

                  left-[45px]
                  top-[5px]

                  h-[52px]
                  w-[18px]

                  rotate-[-28deg]

                  rounded-[45%_55%_35%_65%]

                  border
                  border-white/90

                  bg-white/20

                  shadow-[inset_2px_2px_7px_rgba(255,255,255,0.9)]

                  animate-glass-1
                "
              />


              {/* SHARD 2 */}

              <span
                className="
                  absolute

                  left-[78px]
                  top-0

                  h-[50px]
                  w-[17px]

                  rotate-[18deg]

                  rounded-[55%_40%_60%_45%]

                  border
                  border-white/90

                  bg-white/20

                  shadow-[inset_2px_1px_7px_rgba(255,255,255,0.9)]

                  animate-glass-2
                "
              />


              {/* SHARD 3 */}

              <span
                className="
                  absolute

                  left-[108px]
                  top-[10px]

                  h-[45px]
                  w-[17px]

                  rotate-[52deg]

                  rounded-[40%_60%_45%_55%]

                  border
                  border-white/85

                  bg-white/15

                  shadow-[inset_-2px_2px_6px_rgba(255,255,255,0.8)]

                  animate-glass-3
                "
              />


              {/* SHARD 4 */}

              <span
                className="
                  absolute

                  left-[55px]
                  top-[45px]

                  h-[38px]
                  w-[14px]

                  rotate-[70deg]

                  rounded-[50%]

                  border
                  border-white/85

                  bg-white/15

                  shadow-[inset_2px_1px_5px_rgba(255,255,255,0.85)]

                  animate-glass-4
                "
              />


              {/* SHARD 5 */}

              <span
                className="
                  absolute

                  left-[92px]
                  top-[48px]

                  h-[40px]
                  w-[14px]

                  rotate-[-58deg]

                  rounded-[45%]

                  border
                  border-white/90

                  bg-white/20

                  shadow-[inset_-2px_1px_6px_rgba(255,255,255,0.9)]

                  animate-glass-5
                "
              />


              {/* SHARD 6 */}

              <span
                className="
                  absolute

                  left-[125px]
                  top-[42px]

                  h-[32px]
                  w-[12px]

                  rotate-[35deg]

                  rounded-[50%]

                  border
                  border-white/80

                  bg-white/15

                  shadow-[inset_2px_1px_5px_rgba(255,255,255,0.8)]

                  animate-glass-6
                "
              />


              {/* SMALL SHARD */}

              <span
                className="
                  absolute

                  left-[38px]
                  top-[50px]

                  h-[23px]
                  w-[9px]

                  rotate-[-62deg]

                  rounded-[50%]

                  border
                  border-white/75

                  bg-white/15

                  animate-glass-7
                "
              />

            </div>
          )}

        </button>


        {/* =============================================
            HOVER LABEL
        ============================================== */}

        <div
          className="
            pointer-events-none

            mt-5

            whitespace-nowrap

            translate-y-2
            opacity-0

            transition-all
            duration-300

            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >

          <div
            className={`
              rounded-full

              border

              px-5
              py-2.5

              text-sm
              font-semibold

              shadow-xl

              backdrop-blur-md

              ${
                bulbBroken
                  ? `
                    border-red-300
                    bg-red-50/95
                    text-red-600
                    shadow-red-500/10

                    dark:border-red-500/30
                    dark:bg-red-950/90
                    dark:text-red-400
                  `
                  : `
                    border-slate-200
                    bg-white/95
                    text-slate-700
                    shadow-slate-900/10

                    dark:border-white/10
                    dark:bg-[#111827]/95
                    dark:text-slate-200
                  `
              }
            `}
          >

            {bulbBroken
              ? "Bulb broken · it's dark in here"
              : darkMode
                ? "Light off · click to turn on"
                : "Light on · click to dim"}

          </div>

        </div>

      </div>

    </div>
  );


  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <>

      {/* =================================================
          BULB ANIMATIONS
      ================================================= */}

      <style>
        {`

          /* ============================================
             NATURAL BULB SWING
          ============================================ */

          @keyframes bulbSwing {

            0% {
              transform:
                translateX(-50%)
                rotate(-2deg);
            }

            20% {
              transform:
                translateX(-50%)
                rotate(1.5deg);
            }

            40% {
              transform:
                translateX(-50%)
                rotate(-1.3deg);
            }

            60% {
              transform:
                translateX(-50%)
                rotate(1deg);
            }

            80% {
              transform:
                translateX(-50%)
                rotate(-0.6deg);
            }

            100% {
              transform:
                translateX(-50%)
                rotate(-2deg);
            }

          }


          .bulb-hanging-animation {

            animation:
              bulbSwing
              4.5s
              ease-in-out
              infinite;

            transform-origin:
              top center;
          }


          /* ============================================
             GLASS SHARD 1
          ============================================ */

          @keyframes glass1 {

            0% {
              transform:
                translate(0,0)
                rotate(-28deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(-80px,115px)
                rotate(-230deg)
                scale(0.55);

              opacity: 0;
            }

          }


          /* ============================================
             GLASS SHARD 2
          ============================================ */

          @keyframes glass2 {

            0% {
              transform:
                translate(0,0)
                rotate(18deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(-25px,135px)
                rotate(245deg)
                scale(0.55);

              opacity: 0;
            }

          }


          /* ============================================
             GLASS SHARD 3
          ============================================ */

          @keyframes glass3 {

            0% {
              transform:
                translate(0,0)
                rotate(52deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(90px,120px)
                rotate(270deg)
                scale(0.55);

              opacity: 0;
            }

          }


          /* ============================================
             GLASS SHARD 4
          ============================================ */

          @keyframes glass4 {

            0% {
              transform:
                translate(0,0)
                rotate(70deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(-105px,95px)
                rotate(310deg)
                scale(0.5);

              opacity: 0;
            }

          }


          /* ============================================
             GLASS SHARD 5
          ============================================ */

          @keyframes glass5 {

            0% {
              transform:
                translate(0,0)
                rotate(-58deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(105px,120px)
                rotate(-260deg)
                scale(0.55);

              opacity: 0;
            }

          }


          /* ============================================
             GLASS SHARD 6
          ============================================ */

          @keyframes glass6 {

            0% {
              transform:
                translate(0,0)
                rotate(35deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(125px,85px)
                rotate(220deg)
                scale(0.5);

              opacity: 0;
            }

          }


          /* ============================================
             GLASS SHARD 7
          ============================================ */

          @keyframes glass7 {

            0% {
              transform:
                translate(0,0)
                rotate(-62deg)
                scale(1);

              opacity: 1;
            }

            100% {
              transform:
                translate(-125px,70px)
                rotate(-290deg)
                scale(0.45);

              opacity: 0;
            }

          }


          /* ============================================
             SHARD ANIMATIONS
          ============================================ */

          .animate-glass-1 {
            animation:
              glass1
              950ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }


          .animate-glass-2 {
            animation:
              glass2
              1000ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }


          .animate-glass-3 {
            animation:
              glass3
              950ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }


          .animate-glass-4 {
            animation:
              glass4
              1050ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }


          .animate-glass-5 {
            animation:
              glass5
              1000ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }


          .animate-glass-6 {
            animation:
              glass6
              950ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }


          .animate-glass-7 {
            animation:
              glass7
              900ms
              cubic-bezier(.2,.7,.2,1)
              forwards;
          }

        `}
      </style>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        className={`
          fixed

          left-0

          ${
            showLiveOfferBar &&
            hasLiveOffer
              ? "top-[56px]"
              : "top-0"
          }

          z-[100]

          w-full

          overflow-visible

          border-b
          border-slate-200/70

          bg-white

          /*
           * SLOWER NAVBAR HIDE/SHOW
           */
          transition-transform
          duration-[650ms]
          ease-in-out

          dark:border-white/10
          dark:bg-[#0B1220]

          ${
            showNavbar
              ? "translate-y-0"
              : "-translate-y-full"
          }
        `}
      >

        {/* =================================================
            NAVBAR CONTENT
        ================================================= */}

        <div
          className="
            mx-auto

            flex
            max-w-7xl

            items-center
            justify-between

            px-6
            py-4
          "
        >

          {/* ===============================================
              LOGO
          ================================================ */}

          <Link
            to="/"

            className="
              flex

              cursor-pointer

              items-center
              gap-3
            "
          >

            {logoUrl ? (
              <img
                src={getLogoUrl()}

                alt={siteName}

                className="
                  h-10
                  w-10

                  rounded-md

                  object-contain
                "
              />
            ) : (
              <div
                className="
                  flex

                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-xl

                  bg-[#17213A]

                  text-white
                "
              >
                <BookOpen
                  size={21}
                  strokeWidth={2}
                />
              </div>
            )}


            <span
              className="
                text-2xl

                font-bold

                tracking-tight

                text-[#17213A]

                dark:text-white
              "
            >
              {siteName}
            </span>

          </Link>


          {/* ===============================================
              DESKTOP NAV
          ================================================ */}

          <nav
            className="
              hidden

              items-center

              gap-9

              md:flex
            "
          >

            {navItems.map(
              item => {

                const active =
                  location.pathname ===
                  item.path;


                return (
                  <Link
                    key={
                      item.path
                    }

                    to={
                      item.path
                    }

                    className={`
                      relative

                      py-2

                      text-sm

                      transition

                      ${getNavItemTextClass(
                        item,
                        active
                      )}
                    `}
                  >

                    {item.name}


                    {active && (
                      <span
                        className="
                          nav-active-underline
                        "
                      />
                    )}

                  </Link>
                );
              }
            )}

          </nav>


          {/* ===============================================
              DESKTOP GET STARTED
          ================================================ */}

          <div
            className="
              hidden

              items-center

              gap-3

              md:flex
            "
          >

            <Link
              to="/contact"

              className={`
                rounded-full

                bg-[#17213A]

                px-5
                py-2.5

                text-sm

                font-semibold

                text-white

                shadow-md
                shadow-slate-900/10

                transition

                hover:bg-[#0F172A]

                dark:bg-blue-600
                dark:hover:bg-blue-500

                ${
                  location.pathname ===
                  "/contact"
                    ? "invisible"
                    : ""
                }
              `}
            >
              Get Started
            </Link>

          </div>


          {/* ===============================================
              MOBILE MENU BUTTON
          ================================================ */}

          <div
            className="
              flex

              items-center

              gap-3

              md:hidden
            "
          >

            <button
              type="button"

              onClick={() =>
                setMenuOpen(
                  previous =>
                    !previous
                )
              }

              className="
                flex

                h-10
                w-10

                cursor-pointer

                items-center
                justify-center

                rounded-full

                text-[#17213A]

                transition

                hover:bg-slate-100

                dark:text-white
                dark:hover:bg-white/10
              "

              aria-label="Toggle navigation"

              aria-expanded={
                menuOpen
              }
            >

              {menuOpen ? (
                <X
                  size={24}
                />
              ) : (
                <Menu
                  size={24}
                />
              )}

            </button>

          </div>

        </div>


        {/* =================================================
            MOBILE MENU
        ================================================= */}

        {menuOpen && (
          <nav
            className="
              border-t

              border-slate-100

              bg-white

              px-6
              py-5

              dark:border-white/10
              dark:bg-[#0B1220]

              md:hidden
            "
          >

            <div
              className="
                flex

                flex-col

                gap-5
              "
            >

              {navItems.map(
                item => {

                  const active =
                    location.pathname ===
                    item.path;


                  return (
                    <Link
                      key={
                        item.path
                      }

                      to={
                        item.path
                      }

                      onClick={() =>
                        setMenuOpen(
                          false
                        )
                      }

                      className={`
                        transition

                        ${getNavItemTextClass(
                          item,
                          active
                        )}
                      `}
                    >
                      {item.name}
                    </Link>
                  );
                }
              )}

            </div>

          </nav>
        )}


        {/* =================================================
            BULB
            HOME ONLY
        ================================================= */}

        {location.pathname === "/" &&
          themeToggle}

      </header>

    </>
  );
}


export default Navbar;