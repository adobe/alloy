export const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const getAlloyTestConfigs = () => {
  return {
    cjmProdNld2: {
      name: "CJM Prod NLD2 – Prod (NLD2)",
      alloyInstance: window.alloy,
      datastreamId: "7a19c434-6648-48d3-948f-ba0258505d98",
      orgId: "4DA0571C5FDC4BF70A495FC2@AdobeOrg",
      decisionContext: {},
      edgeDomain: "edge.adobedc.net"
    },
    aemonacpprodcampaign: {
      name: "AEM Assets Departmental - Campaign – Prod (VA7)",
      alloyInstance: window.iamAlloy,
      datastreamId: "8cefc5ca-1c2a-479f-88f2-3d42cc302514",
      orgId: "906E3A095DC834230A495FD6@AdobeOrg",
      decisionContext: {},
      edgeDomain: "edge.adobedc.net"
    },
    stage: {
      name: "CJM Stage - AJO Web (VA7)",
      alloyInstance: window.iamAlloy,
      datastreamId: "15525167-fd4e-4511-b9e0-02119485784f",
      orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
      decisionContext: {},
      edgeDomain: "edge-int.adobedc.net"
    }
  };
};
