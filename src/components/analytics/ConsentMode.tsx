import Script from "next/script";

// Consent Mode v2 + GTM. Renders NOTHING unless NEXT_PUBLIC_GTM_ID is set, so no
// third-party script loads without configuration. The consent DEFAULT (all four
// signals denied) is a plain inline <head> script that runs synchronously as the
// document parses — guaranteed before GTM (loaded afterInteractive) and before
// any tag fires — so nothing tracks until a CMP calls gtag('consent','update',…).
// See ConsentBanner for the (swappable) update integration point.
const CONSENT_DEFAULT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
`;

export default function ConsentMode() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) {
    return null;
  }
  return (
    <>
      {/* Synchronous: must set consent defaults before GTM loads. */}
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }} />
      <Script id="gtm" strategy="afterInteractive">{`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');
      `}</Script>
    </>
  );
}

// The <noscript> GTM fallback for the <body>. Also env-gated.
export function GtmNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) {
    return null;
  }
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="gtm"
      />
    </noscript>
  );
}
