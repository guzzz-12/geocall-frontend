import { useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion, AnimationProps } from "framer-motion";
import { FaCog } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { BsShieldLock } from "react-icons/bs";
import TabItem from "../components/Account/TabItem";
import Navbar from "../components/Navbar";
import withVerification from "../components/HOC/withVerification";
import Profile from "../components/Account/Profile";
import Security from "../components/Account/Security";
import { UserRootState } from "../redux/store";

const animationProps: AnimationProps = {
  initial: "hidden",
  animate: "visible",
  exit: "exit",
  variants: {
    hidden: {translateX: "100%"},
    visible: {translateX: 0},
    exit: {translateX: "100%"}
  },
  transition: {type: "spring", bounce: 0.1, mass: 0.3, stiffness: 130}
};

const AccountPage = () => {
  document.title = "GeoCall App | Account";

  const {currentUser} = useSelector((state: UserRootState) => state.user);

  const [activeTab, setActiveTab] = useState(1);

  if (!currentUser) {
    return null;
  };

  return (
    <section className="flex flex-col justify-start h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0">
        <Navbar navbarType="static" />
      </div>

      <div className="flex flex-grow overflow-x-hidden container-md px-0">
        {/* Columna izquierda (Tabs) */}
        <div className="flex-shrink-0 border-r border-l border-gray-300">
          {/* Header de la columna */}
          <div className="hidden md:flex justify-center items-center gap-3 px-3 py-5 border-b border-gray-300">
            <FaCog className="w-[30px] h-[30px] opacity-30" />
            <h2 className="text-center font-bold text-gray-600 uppercase">
              Account settings
            </h2>
          </div>

          {/* Tabs */}
          <TabItem
            Icon={CgProfile}
            text="Profile"
            tabIndex={1}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <TabItem
            Icon={BsShieldLock}
            text="Security"
            tabIndex={2}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Columna derecha (Contenido) */}
        <div className="flex-grow border-r border-gray-300 overflow-x-hidden">
          <AnimatePresence initial={false} mode="popLayout" presenceAffectsLayout={false}>
            {activeTab === 1 &&
              <motion.div
                key="profile"
                className="h-full -z-20"
                {...animationProps}
              >
                <Profile currentUser={currentUser} />
              </motion.div>
            }
            {activeTab === 2 &&
              <motion.div
                key="security"
                className="h-full -z-20"
                {...animationProps}
              >
                <Security currentUser={currentUser} />
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
};

export default withVerification(AccountPage);