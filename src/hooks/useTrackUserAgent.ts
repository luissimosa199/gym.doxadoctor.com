import { useEffect } from "react";
import { useRouter } from "next/router";
import UAParser from "ua-parser-js";
import { getCookie, hasCookie } from "cookies-next";

const useTrackUserAgent = () => {
  const router = useRouter();

  useEffect(() => {
    // if (process.env.NODE_ENV !== "production") {
    //   return;
    // }

    if (!router.isReady) return;

    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    let utm_params: { [key: string]: string | string[] } = {};

    utmKeys.forEach((key) => {
      if (router.query[key]) {
        utm_params[key] = router.query[key] as string | string[];
      }
    });

    const parser = new UAParser(window.navigator.userAgent);
    const userData = {
      timestamp: new Date(),
      utm_params,
      entry_point: window.location.href,
      os: parser.getOS(),
      browser: parser.getBrowser(),
      device: parser.getDevice(),
    };

    fetch("/api/user_agent_info", {
      method: hasCookie(`user_agent_id`) ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userData, id: getCookie(`user_agent_id`) }),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);
};

export default useTrackUserAgent;
