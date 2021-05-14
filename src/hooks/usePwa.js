import { useEffect, useState } from "react";

const usePWA = () => {
  /**@type {[string: "web"|"standalone" ]} */
  const [isInstalled, setIsInstalled] = useState(null);
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);

    };

    const CheckStandalone = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled('standalone');
      } else {
        setIsInstalled('web');
      }

    }

    const checker = (evt) => {
      setIsInstalled('standalone');
    }

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener('appinstalled', checker);
    CheckStandalone();

    return () => {
      window.removeEventListener("transitionend", handler);
      CheckStandalone();

    }
  }, []);

  const onClickInstall = async evt => {
    evt.preventDefault();

    try {

      const tryInstall = await promptInstall.prompt();
      console.log({ tryInstall });

    } catch (error) {
      console.log({ error })

    }
  };


  return [isInstalled, onClickInstall, supportsPWA];
};

export default usePWA;
