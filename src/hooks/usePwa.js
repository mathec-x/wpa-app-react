import React from "react";

const usePWA = () => {
  /**@type {[string: "web"|"standalone" ]} */
  const [isInstalled, setIsInstalled] = React.useState(null);
  const [supportsPWA, setSupportsPWA] = React.useState(false);
  const [promptInstall, setPromptInstall] = React.useState(null);

  React.useEffect(() => {

    const handler = e => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled('standalone');
    } else {
      setIsInstalled('web');
    }

    window.addEventListener('appinstalled', (evt) => {
      console.log('app installed');
      setIsInstalled('standalone');
    });

    return () => {
      window.removeEventListener("transitionend", handler)
    };
  }, []);

  const onClickInstall = evt => {
    evt.preventDefault();

    if(promptInstall && isInstalled === "web"){
      promptInstall.prompt();
    }

    if(isInstalled === 'standalone') 
      window.location.reload()

    // else window.open('/', '_blank')
  };


  return [isInstalled, onClickInstall, supportsPWA];
};

export default usePWA;
