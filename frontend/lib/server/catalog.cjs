// This directory only labels integrations. A listing is not a guarantee that
// any provider will resolve every individual link successfully.
const definitions = [
  // The following domains are listed as supported by the bypass.vip API examples.
  ["Linkvertise", "linkvertise.com", "Ad-link", "provider-api"],
  ["Admaven / Lootlabs", "lootlabs.gg", "Ad-link", "provider-api"],
  ["Lootlabs Links", "links.lootlabs.gg", "Ad-link", "provider-api"],
  ["Loot-Link", "loot-link.com", "Ad-link", "provider-api"],
  ["Loot-Links", "loot-links.com", "Ad-link", "provider-api"],
  ["Lootdest", "lootdest.org", "Ad-link", "provider-api"],
  ["Lootdest", "lootdest.com", "Ad-link", "provider-api"],
  ["Free Content", "free-content.pro", "Ad-link", "provider-api"],
  ["Link Target", "link-target.org", "Ad-link", "provider-api"],
  ["Link Target", "link-target.net", "Ad-link", "provider-api"],
  ["Mega Guy", "mega-guy.com", "Ad-link", "provider-api"],
  ["Admaven", "ad-maven.com", "Ad-link", "provider-api"],
  ["Adfoc.us", "adfoc.us", "Ad-link", "provider-api"],
  ["Boost.ink", "boost.ink", "Ad-link", "provider-api"],
  ["BST", "bst.gg", "Ad-link", "provider-api"],
  ["Booo.st", "booo.st", "Ad-link", "provider-api"],
  ["Cuty.io", "cuty.io", "Ad-link", "provider-api"],
  ["Cety", "cety.app", "Ad-link", "provider-api"],
  ["mBoost", "mboost.me", "Social unlock", "provider-api"],
  ["Mendation", "mendationforc.info", "Ad-link", "provider-api"],
  ["Paster", "paster.so", "Paste", "provider-api"],
  ["Paster", "paster.gg", "Paste", "provider-api"],
  ["Rekonise", "rekonise.com", "Social unlock", "provider-api"],
  ["Social Unlock", "social-unlock.com", "Social unlock", "provider-api"],
  ["SocialWolvez", "socialwolvez.com", "Social unlock", "provider-api"],
  ["Sub2Get", "sub2get.com", "Social unlock", "provider-api"],
  ["Sub2Unlock", "sub2unlock.com", "Social unlock", "provider-api"],
  ["Sub2Unlock", "sub2unlock.net", "Social unlock", "provider-api"],
  ["Sub4Unlock", "sub4unlock.io", "Social unlock", "provider-api"],
  ["Subfinal", "subfinal.com", "Social unlock", "provider-api"],
  ["Unlocknow", "unlocknow.net", "Social unlock", "provider-api"],
  ["V.GD", "v.gd", "Shortener", "provider-api"],
  ["Work.ink", "work.ink", "Ad-link", "provider-api"],
  ["Work.ink", "workink.net", "Ad-link", "provider-api"],
  ["Ytsubme", "ytsubme.com", "Social unlock", "provider-api"],
  ["JustPaste.it", "justpaste.it", "Paste", "provider-api"],
  ["Paste-Drop", "paste-drop.com", "Paste", "provider-api"],
  ["Pastebin", "pastebin.com", "Paste", "provider-api"],
  ["PasteCanyon", "pastecanyon.com", "Paste", "provider-api"],
  ["PasteHill", "pastehill.com", "Paste", "provider-api"],
  ["PasteMode", "pastemode.com", "Paste", "provider-api"],
  ["Rentry", "rentry.org", "Paste", "provider-api"],
  ["Bitly", "bit.ly", "Shortener", "provider-api"],
  ["Cl.gy", "cl.gy", "Shortener", "provider-api"],
  ["Google short link", "goo.gl", "Shortener", "provider-api"],
  ["Is.gd", "is.gd", "Shortener", "provider-api"],
  ["Rebrandly", "rebrand.ly", "Shortener", "provider-api"],
  ["T.co", "t.co", "Shortener", "provider-api"],
  ["T.ly", "t.ly", "Shortener", "provider-api"],
  ["Tiny.cc", "tiny.cc", "Shortener", "provider-api"],
  ["Tinylink", "tinylink.onl", "Shortener", "provider-api"],
  ["TinyURL", "tinyurl.com", "Shortener", "provider-api"],
  ["Shorter.me", "shorter.me", "Shortener", "provider-api"],
  ["Rkns", "rkns.link", "Shortener", "provider-api"],

  // Key-system URLs may need the user's browser, page session, and userscript.
  // EVO's server resolver does not claim these are API-supported.
  ["Platoboost", "platoboost.com", "Key system", "browser-userscript"],
  ["Plato Relay", "platorelay.com", "Key system", "browser-userscript"],
  ["Panda Development", "pandadevelopment.net", "Key system", "browser-userscript"],
  ["Trigon", "trigonevo.com", "Key system", "browser-userscript"],
  ["Violated", "violated.lol", "Key system", "browser-userscript"],
  ["Blox Script", "blox-script.com", "Key system", "browser-userscript"],
  ["Blox Script", "boblox-script.com", "Key system", "browser-userscript"],
  ["Hydrogen", "hydrogen.lat", "Key system", "browser-userscript"],
  ["Codex", "codex.lol", "Key system", "browser-userscript"]
];

const services = definitions.map(([name, domain, category, status]) => ({
  name,
  domain,
  category,
  status
}));

function detectService(input) {
  let hostname;
  try {
    hostname = new URL(input).hostname.toLowerCase();
  } catch {
    return { name: "Other / unsupported", domain: "*", category: "Other", status: "unsupported" };
  }

  return services.find((service) => (
    hostname === service.domain || hostname.endsWith(`.${service.domain}`)
  )) || {
    name: "Other / unsupported",
    domain: "*",
    category: "Other",
    status: "unsupported"
  };
}

module.exports = { services, detectService };
