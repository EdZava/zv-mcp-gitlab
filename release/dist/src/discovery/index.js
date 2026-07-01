"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDiscoveryResult = exports.autoDiscover = exports.findProfileByHost = exports.matchProfileByHost = exports.listGitRemotes = exports.selectBestRemote = exports.parseGitConfig = exports.parseRemoteUrl = exports.parseGitRemote = void 0;
var git_remote_1 = require("./git-remote");
Object.defineProperty(exports, "parseGitRemote", { enumerable: true, get: function () { return git_remote_1.parseGitRemote; } });
Object.defineProperty(exports, "parseRemoteUrl", { enumerable: true, get: function () { return git_remote_1.parseRemoteUrl; } });
Object.defineProperty(exports, "parseGitConfig", { enumerable: true, get: function () { return git_remote_1.parseGitConfig; } });
Object.defineProperty(exports, "selectBestRemote", { enumerable: true, get: function () { return git_remote_1.selectBestRemote; } });
Object.defineProperty(exports, "listGitRemotes", { enumerable: true, get: function () { return git_remote_1.listGitRemotes; } });
var profile_matcher_1 = require("./profile-matcher");
Object.defineProperty(exports, "matchProfileByHost", { enumerable: true, get: function () { return profile_matcher_1.matchProfileByHost; } });
Object.defineProperty(exports, "findProfileByHost", { enumerable: true, get: function () { return profile_matcher_1.findProfileByHost; } });
var auto_1 = require("./auto");
Object.defineProperty(exports, "autoDiscover", { enumerable: true, get: function () { return auto_1.autoDiscover; } });
Object.defineProperty(exports, "formatDiscoveryResult", { enumerable: true, get: function () { return auto_1.formatDiscoveryResult; } });
//# sourceMappingURL=index.js.map