/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 6197:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OPTIONS = exports.MANAGE_ROLES = void 0;
const core_1 = __nccwpck_require__(1592);
const v10_1 = __nccwpck_require__(3753);
exports.MANAGE_ROLES = Number(v10_1.PermissionFlagsBits.ManageRoles);
exports.OPTIONS = {
    appToken: (0, core_1.getInput)('app-token', { required: true }),
    guildID: (0, core_1.getInput)('guild-id', { required: true }),
    roleID: (0, core_1.getInput)('role-id', { required: true }),
    roleFormat: (_a = (0, core_1.getInput)('role-format', { required: false })) !== null && _a !== void 0 ? _a : 'COTD - %s'
    // &s - Color name (e.g. "COTD - Red")
    // &h - Color hex (e.g. "COTD - #FF0000")
};


/***/ }),

/***/ 1780:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(1592));
const collection_1 = __nccwpck_require__(3629);
const constants_1 = __nccwpck_require__(6197);
const util_1 = __nccwpck_require__(3019);
const request_handler_1 = __importDefault(__nccwpck_require__(1631));
// Check if Token User...
// * has valid access
// * is bot user
// Request:
// * Guild Data (/api/v10/guilds/:guild)
//   > Escape null / Error Code 404 = no access
// * Member Data (/api/v10/guilds/:guild/members/:member)
// Check if Token User...
// * has permissions for MANAGE_ROLES for the guild (not a channel overwrite)
// * is higher on the role list than the target role {b.position - a.position}
// > MUST be higher, not below and certainly not the highest role they have
const randomHexInt = () => Math.floor(Math.random() * 16777215);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { appToken, guildID, roleID, roleFormat } = constants_1.OPTIONS;
            const timer = (0, util_1.wrapDuration)();
            const handler = new request_handler_1.default(appToken);
            // Can only throw exceptions, user is guaranteed to exist if token is valid
            const user = yield handler.getUser();
            const guild = yield handler.getGuild(guildID);
            if (!guild.roles.length)
                throw new Error('No roles found.');
            const roles = new collection_1.Collection(guild.roles.map(r => [r.id, r]));
            const target = roles.get(roleID);
            if (!target)
                throw new Error('Role not found.');
            const member = yield handler.getMember(guildID, user.id);
            // No failover necessary, guild was found and user is authenticated
            const userRoles = roles.filter(r => member.roles.includes(r.id));
            const permissions = (0, util_1.resolvePermissionsOf)(userRoles);
            if (!(0, util_1.hasPermissionFor)(constants_1.MANAGE_ROLES, permissions))
                throw new Error('User does not have permission to manage roles.');
            const highestRole = userRoles
                .sort((a, b) => b.position - a.position)
                .first();
            if (guild.owner || (highestRole && highestRole.position <= target.position))
                throw new Error('User does not have permission to manage this role.');
            const colorCode = randomHexInt();
            const colorHex = colorCode.toString(16);
            const colorDataRes = yield fetch(`https://www.thecolorapi.com/id?hex=${colorHex}`);
            const colorData = yield colorDataRes.json();
            const newRole = yield handler.modifyRole(guildID, roleID, {
                color: colorCode,
                name: roleFormat
                    .replace('&s', colorData.name.value)
                    .replace('&h', colorData.hex.clean)
            });
            const duration = timer();
            core.info(`Role ${newRole.name} has been updated.`);
            core.info(`Old data: ${target.name} | ${target.color}`);
            core.info(`New data: ${newRole.name} | ${newRole.color}`);
            core.info(`Took ${duration} to complete.`);
            core.setOutput('color-int', newRole.color);
            core.setOutput('color-hex', newRole.color.toString(16));
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
            if (typeof error === 'string')
                core.setFailed(error);
        }
    });
}
run();


/***/ }),

/***/ 1631:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/* global RequestInit */
const core_1 = __nccwpck_require__(1592);
const v10_1 = __nccwpck_require__(3753);
const util_1 = __nccwpck_require__(3019);
class RequestHandler {
    constructor(token) {
        this.token = token;
    }
    request(url, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const path = `${(_a = options.method) !== null && _a !== void 0 ? _a : 'GET'} ${url}`;
            (0, core_1.debug)(`Requesting for ${path}`);
            const timer = (0, util_1.wrapDuration)();
            const res = yield fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options.headers), { 'Content-Type': 'application/json', Authorization: `Bot ${this.token}` }) }));
            (0, core_1.debug)(`Request for ${path} took ${timer()}`);
            const data = yield res.json();
            if (data.code || data.message)
                throw new Error(data);
            // Failover is necessary for handler to fallback on for 4** and 5** error codes
            return data;
        });
    }
    /**
     * @returns The authenticated user
     * @throws {Error} If the user is not found
     */
    getUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(v10_1.Routes.user());
        });
    }
    /**
     *
     * @param guildID The guild to get the roles from
     * @returns The requested guild entity
     * @throws {Error} If the guild is not found, within the scope of the authenticated user
     */
    getGuild(guildID) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(v10_1.Routes.guild(guildID));
        });
    }
    /**
     *
     * @param guildID The guild to get the member from
     * @param memberID The member to get
     * @returns The requested member entity
     * @throws {Error} If the member is not found, within the scope of the requested guild
     */
    getMember(guildID, memberID) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(v10_1.Routes.guildMember(guildID, memberID));
        });
    }
    /**
     *
     * @param guildID The guild to get the roles from
     * @param roleID The role to modify
     * @param options The options to modify the role with
     * @returns
     */
    modifyRole(guildID, roleID, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(v10_1.Routes.guildRole(guildID, roleID), {
                method: 'PATCH',
                body: JSON.stringify(options)
            });
        });
    }
}
exports["default"] = RequestHandler;


/***/ }),

/***/ 3019:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.wrapDuration = exports.getDuration = exports.hasPermissionFor = exports.resolvePermissionsOf = void 0;
const ms_1 = __importDefault(__nccwpck_require__(313));
const resolvePermissionsOf = (roles) => roles.reduce((acc, role) => acc | Number(role.permissions), 0);
exports.resolvePermissionsOf = resolvePermissionsOf;
const hasPermissionFor = (flag, permissions) => (permissions & flag) === flag;
exports.hasPermissionFor = hasPermissionFor;
function getDuration(start) {
    const duration = performance.now() - start;
    return `${duration.toFixed(2)}ms`;
}
exports.getDuration = getDuration;
function wrapDuration() {
    const start = performance.now();
    return () => {
        const end = performance.now();
        return (0, ms_1.default)(end - start);
    };
}
exports.wrapDuration = wrapDuration;


/***/ }),

/***/ 8716:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(6834);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 1592:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(8716);
const file_command_1 = __nccwpck_require__(2684);
const utils_1 = __nccwpck_require__(6834);
const os = __importStar(__nccwpck_require__(2037));
const path = __importStar(__nccwpck_require__(1017));
const uuid_1 = __nccwpck_require__(5305);
const oidc_utils_1 = __nccwpck_require__(97);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = `ghadelimiter_${uuid_1.v4()}`;
        // These should realistically never happen, but just in case someone finds a way to exploit uuid generation let's not allow keys or values that contain the delimiter.
        if (name.includes(delimiter)) {
            throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
        }
        if (convertedVal.includes(delimiter)) {
            throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
        }
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
function getIDToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
    });
}
exports.getIDToken = getIDToken;
/**
 * Summary exports
 */
var summary_1 = __nccwpck_require__(7530);
Object.defineProperty(exports, "summary", ({ enumerable: true, get: function () { return summary_1.summary; } }));
/**
 * @deprecated use core.summary
 */
var summary_2 = __nccwpck_require__(7530);
Object.defineProperty(exports, "markdownSummary", ({ enumerable: true, get: function () { return summary_2.markdownSummary; } }));
/**
 * Path exports
 */
var path_utils_1 = __nccwpck_require__(5852);
Object.defineProperty(exports, "toPosixPath", ({ enumerable: true, get: function () { return path_utils_1.toPosixPath; } }));
Object.defineProperty(exports, "toWin32Path", ({ enumerable: true, get: function () { return path_utils_1.toWin32Path; } }));
Object.defineProperty(exports, "toPlatformPath", ({ enumerable: true, get: function () { return path_utils_1.toPlatformPath; } }));
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 2684:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(7147));
const os = __importStar(__nccwpck_require__(2037));
const utils_1 = __nccwpck_require__(6834);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 97:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OidcClient = void 0;
const http_client_1 = __nccwpck_require__(7975);
const auth_1 = __nccwpck_require__(2115);
const core_1 = __nccwpck_require__(1592);
class OidcClient {
    static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
            allowRetries: allowRetry,
            maxRetries: maxRetry
        };
        return new http_client_1.HttpClient('actions/oidc-client', [new auth_1.BearerCredentialHandler(OidcClient.getRequestToken())], requestOptions);
    }
    static getRequestToken() {
        const token = process.env['ACTIONS_ID_TOKEN_REQUEST_TOKEN'];
        if (!token) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable');
        }
        return token;
    }
    static getIDTokenUrl() {
        const runtimeUrl = process.env['ACTIONS_ID_TOKEN_REQUEST_URL'];
        if (!runtimeUrl) {
            throw new Error('Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable');
        }
        return runtimeUrl;
    }
    static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const httpclient = OidcClient.createHttpClient();
            const res = yield httpclient
                .getJson(id_token_url)
                .catch(error => {
                throw new Error(`Failed to get ID Token. \n 
        Error Code : ${error.statusCode}\n 
        Error Message: ${error.result.message}`);
            });
            const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
            if (!id_token) {
                throw new Error('Response json body do not have ID Token field');
            }
            return id_token;
        });
    }
    static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // New ID Token is requested from action service
                let id_token_url = OidcClient.getIDTokenUrl();
                if (audience) {
                    const encodedAudience = encodeURIComponent(audience);
                    id_token_url = `${id_token_url}&audience=${encodedAudience}`;
                }
                core_1.debug(`ID token url is ${id_token_url}`);
                const id_token = yield OidcClient.getCall(id_token_url);
                core_1.setSecret(id_token);
                return id_token;
            }
            catch (error) {
                throw new Error(`Error message: ${error.message}`);
            }
        });
    }
}
exports.OidcClient = OidcClient;
//# sourceMappingURL=oidc-utils.js.map

/***/ }),

/***/ 5852:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
const path = __importStar(__nccwpck_require__(1017));
/**
 * toPosixPath converts the given path to the posix form. On Windows, \\ will be
 * replaced with /.
 *
 * @param pth. Path to transform.
 * @return string Posix path.
 */
function toPosixPath(pth) {
    return pth.replace(/[\\]/g, '/');
}
exports.toPosixPath = toPosixPath;
/**
 * toWin32Path converts the given path to the win32 form. On Linux, / will be
 * replaced with \\.
 *
 * @param pth. Path to transform.
 * @return string Win32 path.
 */
function toWin32Path(pth) {
    return pth.replace(/[/]/g, '\\');
}
exports.toWin32Path = toWin32Path;
/**
 * toPlatformPath converts the given path to a platform-specific path. It does
 * this by replacing instances of / and \ with the platform-specific path
 * separator.
 *
 * @param pth The path to platformize.
 * @return string The platform-specific path.
 */
function toPlatformPath(pth) {
    return pth.replace(/[/\\]/g, path.sep);
}
exports.toPlatformPath = toPlatformPath;
//# sourceMappingURL=path-utils.js.map

/***/ }),

/***/ 7530:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
const os_1 = __nccwpck_require__(2037);
const fs_1 = __nccwpck_require__(7147);
const { access, appendFile, writeFile } = fs_1.promises;
exports.SUMMARY_ENV_VAR = 'GITHUB_STEP_SUMMARY';
exports.SUMMARY_DOCS_URL = 'https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary';
class Summary {
    constructor() {
        this._buffer = '';
    }
    /**
     * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
     * Also checks r/w permissions.
     *
     * @returns step summary file path
     */
    filePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._filePath) {
                return this._filePath;
            }
            const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
            if (!pathFromEnv) {
                throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
            }
            try {
                yield access(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
            }
            this._filePath = pathFromEnv;
            return this._filePath;
        });
    }
    /**
     * Wraps content in an HTML tag, adding any HTML attributes
     *
     * @param {string} tag HTML tag to wrap
     * @param {string | null} content content within the tag
     * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
     *
     * @returns {string} content wrapped in HTML element
     */
    wrap(tag, content, attrs = {}) {
        const htmlAttrs = Object.entries(attrs)
            .map(([key, value]) => ` ${key}="${value}"`)
            .join('');
        if (!content) {
            return `<${tag}${htmlAttrs}>`;
        }
        return `<${tag}${htmlAttrs}>${content}</${tag}>`;
    }
    /**
     * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
     *
     * @param {SummaryWriteOptions} [options] (optional) options for write operation
     *
     * @returns {Promise<Summary>} summary instance
     */
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
            const filePath = yield this.filePath();
            const writeFunc = overwrite ? writeFile : appendFile;
            yield writeFunc(filePath, this._buffer, { encoding: 'utf8' });
            return this.emptyBuffer();
        });
    }
    /**
     * Clears the summary buffer and wipes the summary file
     *
     * @returns {Summary} summary instance
     */
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.emptyBuffer().write({ overwrite: true });
        });
    }
    /**
     * Returns the current summary buffer as a string
     *
     * @returns {string} string of summary buffer
     */
    stringify() {
        return this._buffer;
    }
    /**
     * If the summary buffer is empty
     *
     * @returns {boolen} true if the buffer is empty
     */
    isEmptyBuffer() {
        return this._buffer.length === 0;
    }
    /**
     * Resets the summary buffer without writing to summary file
     *
     * @returns {Summary} summary instance
     */
    emptyBuffer() {
        this._buffer = '';
        return this;
    }
    /**
     * Adds raw text to the summary buffer
     *
     * @param {string} text content to add
     * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
     *
     * @returns {Summary} summary instance
     */
    addRaw(text, addEOL = false) {
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
    }
    /**
     * Adds the operating system-specific end-of-line marker to the buffer
     *
     * @returns {Summary} summary instance
     */
    addEOL() {
        return this.addRaw(os_1.EOL);
    }
    /**
     * Adds an HTML codeblock to the summary buffer
     *
     * @param {string} code content to render within fenced code block
     * @param {string} lang (optional) language to syntax highlight code
     *
     * @returns {Summary} summary instance
     */
    addCodeBlock(code, lang) {
        const attrs = Object.assign({}, (lang && { lang }));
        const element = this.wrap('pre', this.wrap('code', code), attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML list to the summary buffer
     *
     * @param {string[]} items list of items to render
     * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
     *
     * @returns {Summary} summary instance
     */
    addList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => this.wrap('li', item)).join('');
        const element = this.wrap(tag, listItems);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML table to the summary buffer
     *
     * @param {SummaryTableCell[]} rows table rows
     *
     * @returns {Summary} summary instance
     */
    addTable(rows) {
        const tableBody = rows
            .map(row => {
            const cells = row
                .map(cell => {
                if (typeof cell === 'string') {
                    return this.wrap('td', cell);
                }
                const { header, data, colspan, rowspan } = cell;
                const tag = header ? 'th' : 'td';
                const attrs = Object.assign(Object.assign({}, (colspan && { colspan })), (rowspan && { rowspan }));
                return this.wrap(tag, data, attrs);
            })
                .join('');
            return this.wrap('tr', cells);
        })
            .join('');
        const element = this.wrap('table', tableBody);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds a collapsable HTML details element to the summary buffer
     *
     * @param {string} label text for the closed state
     * @param {string} content collapsable content
     *
     * @returns {Summary} summary instance
     */
    addDetails(label, content) {
        const element = this.wrap('details', this.wrap('summary', label) + content);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML image tag to the summary buffer
     *
     * @param {string} src path to the image you to embed
     * @param {string} alt text description of the image
     * @param {SummaryImageOptions} options (optional) addition image attributes
     *
     * @returns {Summary} summary instance
     */
    addImage(src, alt, options) {
        const { width, height } = options || {};
        const attrs = Object.assign(Object.assign({}, (width && { width })), (height && { height }));
        const element = this.wrap('img', null, Object.assign({ src, alt }, attrs));
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML section heading element
     *
     * @param {string} text heading text
     * @param {number | string} [level=1] (optional) the heading level, default: 1
     *
     * @returns {Summary} summary instance
     */
    addHeading(text, level) {
        const tag = `h${level}`;
        const allowedTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
            ? tag
            : 'h1';
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML thematic break (<hr>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addSeparator() {
        const element = this.wrap('hr', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML line break (<br>) to the summary buffer
     *
     * @returns {Summary} summary instance
     */
    addBreak() {
        const element = this.wrap('br', null);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML blockquote to the summary buffer
     *
     * @param {string} text quote text
     * @param {string} cite (optional) citation url
     *
     * @returns {Summary} summary instance
     */
    addQuote(text, cite) {
        const attrs = Object.assign({}, (cite && { cite }));
        const element = this.wrap('blockquote', text, attrs);
        return this.addRaw(element).addEOL();
    }
    /**
     * Adds an HTML anchor tag to the summary buffer
     *
     * @param {string} text link text/content
     * @param {string} href hyperlink
     *
     * @returns {Summary} summary instance
     */
    addLink(text, href) {
        const element = this.wrap('a', text, { href });
        return this.addRaw(element).addEOL();
    }
}
const _summary = new Summary();
/**
 * @deprecated use `core.summary`
 */
exports.markdownSummary = _summary;
exports.summary = _summary;
//# sourceMappingURL=summary.js.map

/***/ }),

/***/ 6834:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        file: annotationProperties.file,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 2115:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
class BasicCredentialHandler {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BasicCredentialHandler = BasicCredentialHandler;
class BearerCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.BearerCredentialHandler = BearerCredentialHandler;
class PersonalAccessTokenCredentialHandler {
    constructor(token) {
        this.token = token;
    }
    // currently implements pre-authorization
    // TODO: support preAuth = false where it hooks on 401
    prepareRequest(options) {
        if (!options.headers) {
            throw Error('The request has no headers');
        }
        options.headers['Authorization'] = `Basic ${Buffer.from(`PAT:${this.token}`).toString('base64')}`;
    }
    // This handler cannot handle 401
    canHandleAuthentication() {
        return false;
    }
    handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
}
exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ 7975:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
const http = __importStar(__nccwpck_require__(3685));
const https = __importStar(__nccwpck_require__(5687));
const pm = __importStar(__nccwpck_require__(8366));
const tunnel = __importStar(__nccwpck_require__(6246));
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'HttpClientError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}
exports.HttpClientError = HttpClientError;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let output = Buffer.alloc(0);
                this.message.on('data', (chunk) => {
                    output = Buffer.concat([output, chunk]);
                });
                this.message.on('end', () => {
                    resolve(output.toString());
                });
            }));
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    const parsedUrl = new URL(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
        });
    }
    get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('GET', requestUrl, null, additionalHeaders || {});
        });
    }
    del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('DELETE', requestUrl, null, additionalHeaders || {});
        });
    }
    post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('POST', requestUrl, data, additionalHeaders || {});
        });
    }
    patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PATCH', requestUrl, data, additionalHeaders || {});
        });
    }
    put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('PUT', requestUrl, data, additionalHeaders || {});
        });
    }
    head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('HEAD', requestUrl, null, additionalHeaders || {});
        });
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(verb, requestUrl, stream, additionalHeaders);
        });
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            const res = yield this.get(requestUrl, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.post(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.put(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify(obj, null, 2);
            additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
            additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
            const res = yield this.patch(requestUrl, data, additionalHeaders);
            return this._processResponse(res, this.requestOptions);
        });
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._disposed) {
                throw new Error('Client has already been disposed.');
            }
            const parsedUrl = new URL(requestUrl);
            let info = this._prepareRequest(verb, parsedUrl, headers);
            // Only perform retries on reads since writes may not be idempotent.
            const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb)
                ? this._maxRetries + 1
                : 1;
            let numTries = 0;
            let response;
            do {
                response = yield this.requestRaw(info, data);
                // Check if it's an authentication challenge
                if (response &&
                    response.message &&
                    response.message.statusCode === HttpCodes.Unauthorized) {
                    let authenticationHandler;
                    for (const handler of this.handlers) {
                        if (handler.canHandleAuthentication(response)) {
                            authenticationHandler = handler;
                            break;
                        }
                    }
                    if (authenticationHandler) {
                        return authenticationHandler.handleAuthentication(this, info, data);
                    }
                    else {
                        // We have received an unauthorized response but have no handlers to handle it.
                        // Let the response return to the caller.
                        return response;
                    }
                }
                let redirectsRemaining = this._maxRedirects;
                while (response.message.statusCode &&
                    HttpRedirectCodes.includes(response.message.statusCode) &&
                    this._allowRedirects &&
                    redirectsRemaining > 0) {
                    const redirectUrl = response.message.headers['location'];
                    if (!redirectUrl) {
                        // if there's no location to redirect to, we won't
                        break;
                    }
                    const parsedRedirectUrl = new URL(redirectUrl);
                    if (parsedUrl.protocol === 'https:' &&
                        parsedUrl.protocol !== parsedRedirectUrl.protocol &&
                        !this._allowRedirectDowngrade) {
                        throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                    }
                    // we need to finish reading the response before reassigning response
                    // which will leak the open socket.
                    yield response.readBody();
                    // strip authorization header if redirected to a different hostname
                    if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                        for (const header in headers) {
                            // header names are case insensitive
                            if (header.toLowerCase() === 'authorization') {
                                delete headers[header];
                            }
                        }
                    }
                    // let's make the request with the new redirectUrl
                    info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                    response = yield this.requestRaw(info, data);
                    redirectsRemaining--;
                }
                if (!response.message.statusCode ||
                    !HttpResponseRetryCodes.includes(response.message.statusCode)) {
                    // If not a retry code, return immediately instead of retrying
                    return response;
                }
                numTries += 1;
                if (numTries < maxTries) {
                    yield response.readBody();
                    yield this._performExponentialBackoff(numTries);
                }
            } while (numTries < maxTries);
            return response;
        });
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                function callbackForResult(err, res) {
                    if (err) {
                        reject(err);
                    }
                    else if (!res) {
                        // If `err` is not passed, then `res` must be passed.
                        reject(new Error('Unknown error'));
                    }
                    else {
                        resolve(res);
                    }
                }
                this.requestRawWithCallback(info, data, callbackForResult);
            });
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        if (typeof data === 'string') {
            if (!info.options.headers) {
                info.options.headers = {};
            }
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        function handleResult(err, res) {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        }
        const req = info.httpModule.request(info.options, (msg) => {
            const res = new HttpClientResponse(msg);
            handleResult(undefined, res);
        });
        let socket;
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error(`Request timeout: ${info.options.path}`));
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            for (const handler of this.handlers) {
                handler.prepareRequest(info.options);
            }
        }
        return info;
    }
    _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        // This is `useProxy` again, but we need to check `proxyURl` directly for TypeScripts's flow analysis.
        if (proxyUrl && proxyUrl.hostname) {
            const agentOptions = {
                maxSockets,
                keepAlive: this._keepAlive,
                proxy: Object.assign(Object.assign({}, ((proxyUrl.username || proxyUrl.password) && {
                    proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
                })), { host: proxyUrl.hostname, port: proxyUrl.port })
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
            const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
            return new Promise(resolve => setTimeout(() => resolve(), ms));
        });
    }
    _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const statusCode = res.message.statusCode || 0;
                const response = {
                    statusCode,
                    result: null,
                    headers: {}
                };
                // not found leads to null obj returned
                if (statusCode === HttpCodes.NotFound) {
                    resolve(response);
                }
                // get the result from the body
                function dateTimeDeserializer(key, value) {
                    if (typeof value === 'string') {
                        const a = new Date(value);
                        if (!isNaN(a.valueOf())) {
                            return a;
                        }
                    }
                    return value;
                }
                let obj;
                let contents;
                try {
                    contents = yield res.readBody();
                    if (contents && contents.length > 0) {
                        if (options && options.deserializeDates) {
                            obj = JSON.parse(contents, dateTimeDeserializer);
                        }
                        else {
                            obj = JSON.parse(contents);
                        }
                        response.result = obj;
                    }
                    response.headers = res.message.headers;
                }
                catch (err) {
                    // Invalid resource (contents not json);  leaving result obj null
                }
                // note that 3xx redirects are handled by the http layer.
                if (statusCode > 299) {
                    let msg;
                    // if exception/error in body, attempt to get better error
                    if (obj && obj.message) {
                        msg = obj.message;
                    }
                    else if (contents && contents.length > 0) {
                        // it may be the case that the exception is in the body message as string
                        msg = contents;
                    }
                    else {
                        msg = `Failed request: (${statusCode})`;
                    }
                    const err = new HttpClientError(msg, statusCode);
                    err.result = response.result;
                    reject(err);
                }
                else {
                    resolve(response);
                }
            }));
        });
    }
}
exports.HttpClient = HttpClient;
const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 8366:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkBypass = exports.getProxyUrl = void 0;
function getProxyUrl(reqUrl) {
    const usingSsl = reqUrl.protocol === 'https:';
    if (checkBypass(reqUrl)) {
        return undefined;
    }
    const proxyVar = (() => {
        if (usingSsl) {
            return process.env['https_proxy'] || process.env['HTTPS_PROXY'];
        }
        else {
            return process.env['http_proxy'] || process.env['HTTP_PROXY'];
        }
    })();
    if (proxyVar) {
        return new URL(proxyVar);
    }
    else {
        return undefined;
    }
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    const noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    const upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (const upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
//# sourceMappingURL=proxy.js.map

/***/ }),

/***/ 9522:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=common.js.map

/***/ }),

/***/ 1817:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/topics/gateway
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GatewayDispatchEvents = exports.GatewayIntentBits = exports.GatewayCloseCodes = exports.GatewayOpcodes = exports.GatewayVersion = void 0;
__exportStar(__nccwpck_require__(9522), exports);
exports.GatewayVersion = '10';
/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
 */
var GatewayOpcodes;
(function (GatewayOpcodes) {
    /**
     * An event was dispatched
     */
    GatewayOpcodes[GatewayOpcodes["Dispatch"] = 0] = "Dispatch";
    /**
     * A bidirectional opcode to maintain an active gateway connection.
     * Fired periodically by the client, or fired by the gateway to request an immediate heartbeat from the client.
     */
    GatewayOpcodes[GatewayOpcodes["Heartbeat"] = 1] = "Heartbeat";
    /**
     * Starts a new session during the initial handshake
     */
    GatewayOpcodes[GatewayOpcodes["Identify"] = 2] = "Identify";
    /**
     * Update the client's presence
     */
    GatewayOpcodes[GatewayOpcodes["PresenceUpdate"] = 3] = "PresenceUpdate";
    /**
     * Used to join/leave or move between voice channels
     */
    GatewayOpcodes[GatewayOpcodes["VoiceStateUpdate"] = 4] = "VoiceStateUpdate";
    /**
     * Resume a previous session that was disconnected
     */
    GatewayOpcodes[GatewayOpcodes["Resume"] = 6] = "Resume";
    /**
     * You should attempt to reconnect and resume immediately
     */
    GatewayOpcodes[GatewayOpcodes["Reconnect"] = 7] = "Reconnect";
    /**
     * Request information about offline guild members in a large guild
     */
    GatewayOpcodes[GatewayOpcodes["RequestGuildMembers"] = 8] = "RequestGuildMembers";
    /**
     * The session has been invalidated. You should reconnect and identify/resume accordingly
     */
    GatewayOpcodes[GatewayOpcodes["InvalidSession"] = 9] = "InvalidSession";
    /**
     * Sent immediately after connecting, contains the `heartbeat_interval` to use
     */
    GatewayOpcodes[GatewayOpcodes["Hello"] = 10] = "Hello";
    /**
     * Sent in response to receiving a heartbeat to acknowledge that it has been received
     */
    GatewayOpcodes[GatewayOpcodes["HeartbeatAck"] = 11] = "HeartbeatAck";
})(GatewayOpcodes = exports.GatewayOpcodes || (exports.GatewayOpcodes = {}));
/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes
 */
var GatewayCloseCodes;
(function (GatewayCloseCodes) {
    /**
     * We're not sure what went wrong. Try reconnecting?
     */
    GatewayCloseCodes[GatewayCloseCodes["UnknownError"] = 4000] = "UnknownError";
    /**
     * You sent an invalid Gateway opcode or an invalid payload for an opcode. Don't do that!
     *
     * See https://discord.com/developers/docs/topics/gateway#payloads-and-opcodes
     */
    GatewayCloseCodes[GatewayCloseCodes["UnknownOpcode"] = 4001] = "UnknownOpcode";
    /**
     * You sent an invalid payload to us. Don't do that!
     *
     * See https://discord.com/developers/docs/topics/gateway#sending-payloads
     */
    GatewayCloseCodes[GatewayCloseCodes["DecodeError"] = 4002] = "DecodeError";
    /**
     * You sent us a payload prior to identifying
     *
     * See https://discord.com/developers/docs/topics/gateway#identify
     */
    GatewayCloseCodes[GatewayCloseCodes["NotAuthenticated"] = 4003] = "NotAuthenticated";
    /**
     * The account token sent with your identify payload is incorrect
     *
     * See https://discord.com/developers/docs/topics/gateway#identify
     */
    GatewayCloseCodes[GatewayCloseCodes["AuthenticationFailed"] = 4004] = "AuthenticationFailed";
    /**
     * You sent more than one identify payload. Don't do that!
     */
    GatewayCloseCodes[GatewayCloseCodes["AlreadyAuthenticated"] = 4005] = "AlreadyAuthenticated";
    /**
     * The sequence sent when resuming the session was invalid. Reconnect and start a new session
     *
     * See https://discord.com/developers/docs/topics/gateway#resume
     */
    GatewayCloseCodes[GatewayCloseCodes["InvalidSeq"] = 4007] = "InvalidSeq";
    /**
     * Woah nelly! You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this
     */
    GatewayCloseCodes[GatewayCloseCodes["RateLimited"] = 4008] = "RateLimited";
    /**
     * Your session timed out. Reconnect and start a new one
     */
    GatewayCloseCodes[GatewayCloseCodes["SessionTimedOut"] = 4009] = "SessionTimedOut";
    /**
     * You sent us an invalid shard when identifying
     *
     * See https://discord.com/developers/docs/topics/gateway#sharding
     */
    GatewayCloseCodes[GatewayCloseCodes["InvalidShard"] = 4010] = "InvalidShard";
    /**
     * The session would have handled too many guilds - you are required to shard your connection in order to connect
     *
     * See https://discord.com/developers/docs/topics/gateway#sharding
     */
    GatewayCloseCodes[GatewayCloseCodes["ShardingRequired"] = 4011] = "ShardingRequired";
    /**
     * You sent an invalid version for the gateway
     */
    GatewayCloseCodes[GatewayCloseCodes["InvalidAPIVersion"] = 4012] = "InvalidAPIVersion";
    /**
     * You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value
     *
     * See https://discord.com/developers/docs/topics/gateway#gateway-intents
     */
    GatewayCloseCodes[GatewayCloseCodes["InvalidIntents"] = 4013] = "InvalidIntents";
    /**
     * You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not
     * enabled or are not whitelisted for
     *
     * See https://discord.com/developers/docs/topics/gateway#gateway-intents
     *
     * See https://discord.com/developers/docs/topics/gateway#privileged-intents
     */
    GatewayCloseCodes[GatewayCloseCodes["DisallowedIntents"] = 4014] = "DisallowedIntents";
})(GatewayCloseCodes = exports.GatewayCloseCodes || (exports.GatewayCloseCodes = {}));
/**
 * https://discord.com/developers/docs/topics/gateway#list-of-intents
 */
var GatewayIntentBits;
(function (GatewayIntentBits) {
    GatewayIntentBits[GatewayIntentBits["Guilds"] = 1] = "Guilds";
    GatewayIntentBits[GatewayIntentBits["GuildMembers"] = 2] = "GuildMembers";
    GatewayIntentBits[GatewayIntentBits["GuildBans"] = 4] = "GuildBans";
    GatewayIntentBits[GatewayIntentBits["GuildEmojisAndStickers"] = 8] = "GuildEmojisAndStickers";
    GatewayIntentBits[GatewayIntentBits["GuildIntegrations"] = 16] = "GuildIntegrations";
    GatewayIntentBits[GatewayIntentBits["GuildWebhooks"] = 32] = "GuildWebhooks";
    GatewayIntentBits[GatewayIntentBits["GuildInvites"] = 64] = "GuildInvites";
    GatewayIntentBits[GatewayIntentBits["GuildVoiceStates"] = 128] = "GuildVoiceStates";
    GatewayIntentBits[GatewayIntentBits["GuildPresences"] = 256] = "GuildPresences";
    GatewayIntentBits[GatewayIntentBits["GuildMessages"] = 512] = "GuildMessages";
    GatewayIntentBits[GatewayIntentBits["GuildMessageReactions"] = 1024] = "GuildMessageReactions";
    GatewayIntentBits[GatewayIntentBits["GuildMessageTyping"] = 2048] = "GuildMessageTyping";
    GatewayIntentBits[GatewayIntentBits["DirectMessages"] = 4096] = "DirectMessages";
    GatewayIntentBits[GatewayIntentBits["DirectMessageReactions"] = 8192] = "DirectMessageReactions";
    GatewayIntentBits[GatewayIntentBits["DirectMessageTyping"] = 16384] = "DirectMessageTyping";
    GatewayIntentBits[GatewayIntentBits["MessageContent"] = 32768] = "MessageContent";
    GatewayIntentBits[GatewayIntentBits["GuildScheduledEvents"] = 65536] = "GuildScheduledEvents";
})(GatewayIntentBits = exports.GatewayIntentBits || (exports.GatewayIntentBits = {}));
/**
 * https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-events
 */
var GatewayDispatchEvents;
(function (GatewayDispatchEvents) {
    GatewayDispatchEvents["ApplicationCommandPermissionsUpdate"] = "APPLICATION_COMMAND_PERMISSIONS_UPDATE";
    GatewayDispatchEvents["ChannelCreate"] = "CHANNEL_CREATE";
    GatewayDispatchEvents["ChannelDelete"] = "CHANNEL_DELETE";
    GatewayDispatchEvents["ChannelPinsUpdate"] = "CHANNEL_PINS_UPDATE";
    GatewayDispatchEvents["ChannelUpdate"] = "CHANNEL_UPDATE";
    GatewayDispatchEvents["GuildBanAdd"] = "GUILD_BAN_ADD";
    GatewayDispatchEvents["GuildBanRemove"] = "GUILD_BAN_REMOVE";
    GatewayDispatchEvents["GuildCreate"] = "GUILD_CREATE";
    GatewayDispatchEvents["GuildDelete"] = "GUILD_DELETE";
    GatewayDispatchEvents["GuildEmojisUpdate"] = "GUILD_EMOJIS_UPDATE";
    GatewayDispatchEvents["GuildIntegrationsUpdate"] = "GUILD_INTEGRATIONS_UPDATE";
    GatewayDispatchEvents["GuildMemberAdd"] = "GUILD_MEMBER_ADD";
    GatewayDispatchEvents["GuildMemberRemove"] = "GUILD_MEMBER_REMOVE";
    GatewayDispatchEvents["GuildMembersChunk"] = "GUILD_MEMBERS_CHUNK";
    GatewayDispatchEvents["GuildMemberUpdate"] = "GUILD_MEMBER_UPDATE";
    GatewayDispatchEvents["GuildRoleCreate"] = "GUILD_ROLE_CREATE";
    GatewayDispatchEvents["GuildRoleDelete"] = "GUILD_ROLE_DELETE";
    GatewayDispatchEvents["GuildRoleUpdate"] = "GUILD_ROLE_UPDATE";
    GatewayDispatchEvents["GuildStickersUpdate"] = "GUILD_STICKERS_UPDATE";
    GatewayDispatchEvents["GuildUpdate"] = "GUILD_UPDATE";
    GatewayDispatchEvents["IntegrationCreate"] = "INTEGRATION_CREATE";
    GatewayDispatchEvents["IntegrationDelete"] = "INTEGRATION_DELETE";
    GatewayDispatchEvents["IntegrationUpdate"] = "INTEGRATION_UPDATE";
    GatewayDispatchEvents["InteractionCreate"] = "INTERACTION_CREATE";
    GatewayDispatchEvents["InviteCreate"] = "INVITE_CREATE";
    GatewayDispatchEvents["InviteDelete"] = "INVITE_DELETE";
    GatewayDispatchEvents["MessageCreate"] = "MESSAGE_CREATE";
    GatewayDispatchEvents["MessageDelete"] = "MESSAGE_DELETE";
    GatewayDispatchEvents["MessageDeleteBulk"] = "MESSAGE_DELETE_BULK";
    GatewayDispatchEvents["MessageReactionAdd"] = "MESSAGE_REACTION_ADD";
    GatewayDispatchEvents["MessageReactionRemove"] = "MESSAGE_REACTION_REMOVE";
    GatewayDispatchEvents["MessageReactionRemoveAll"] = "MESSAGE_REACTION_REMOVE_ALL";
    GatewayDispatchEvents["MessageReactionRemoveEmoji"] = "MESSAGE_REACTION_REMOVE_EMOJI";
    GatewayDispatchEvents["MessageUpdate"] = "MESSAGE_UPDATE";
    GatewayDispatchEvents["PresenceUpdate"] = "PRESENCE_UPDATE";
    GatewayDispatchEvents["StageInstanceCreate"] = "STAGE_INSTANCE_CREATE";
    GatewayDispatchEvents["StageInstanceDelete"] = "STAGE_INSTANCE_DELETE";
    GatewayDispatchEvents["StageInstanceUpdate"] = "STAGE_INSTANCE_UPDATE";
    GatewayDispatchEvents["Ready"] = "READY";
    GatewayDispatchEvents["Resumed"] = "RESUMED";
    GatewayDispatchEvents["ThreadCreate"] = "THREAD_CREATE";
    GatewayDispatchEvents["ThreadDelete"] = "THREAD_DELETE";
    GatewayDispatchEvents["ThreadListSync"] = "THREAD_LIST_SYNC";
    GatewayDispatchEvents["ThreadMembersUpdate"] = "THREAD_MEMBERS_UPDATE";
    GatewayDispatchEvents["ThreadMemberUpdate"] = "THREAD_MEMBER_UPDATE";
    GatewayDispatchEvents["ThreadUpdate"] = "THREAD_UPDATE";
    GatewayDispatchEvents["TypingStart"] = "TYPING_START";
    GatewayDispatchEvents["UserUpdate"] = "USER_UPDATE";
    GatewayDispatchEvents["VoiceServerUpdate"] = "VOICE_SERVER_UPDATE";
    GatewayDispatchEvents["VoiceStateUpdate"] = "VOICE_STATE_UPDATE";
    GatewayDispatchEvents["WebhooksUpdate"] = "WEBHOOKS_UPDATE";
    GatewayDispatchEvents["GuildScheduledEventCreate"] = "GUILD_SCHEDULED_EVENT_CREATE";
    GatewayDispatchEvents["GuildScheduledEventUpdate"] = "GUILD_SCHEDULED_EVENT_UPDATE";
    GatewayDispatchEvents["GuildScheduledEventDelete"] = "GUILD_SCHEDULED_EVENT_DELETE";
    GatewayDispatchEvents["GuildScheduledEventUserAdd"] = "GUILD_SCHEDULED_EVENT_USER_ADD";
    GatewayDispatchEvents["GuildScheduledEventUserRemove"] = "GUILD_SCHEDULED_EVENT_USER_REMOVE";
})(GatewayDispatchEvents = exports.GatewayDispatchEvents || (exports.GatewayDispatchEvents = {}));
// #endregion Shared
//# sourceMappingURL=v10.js.map

/***/ }),

/***/ 8774:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FormattingPatterns = void 0;
/**
 * https://discord.com/developers/docs/reference#message-formatting-formats
 */
exports.FormattingPatterns = {
    /**
     * Regular expression for matching a user mention, strictly without a nickname
     *
     * The `id` group property is present on the `exec` result of this expression
     */
    User: /<@(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a user mention, strictly with a nickname
     *
     * The `id` group property is present on the `exec` result of this expression
     * @deprecated Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it
     */
    UserWithNickname: /<@!(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a user mention, with or without a nickname
     *
     * The `id` group property is present on the `exec` result of this expression
     * @deprecated Passing `!` in user mentions is no longer necessary / supported, and future message contents won't have it
     */
    UserWithOptionalNickname: /<@!?(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a channel mention
     *
     * The `id` group property is present on the `exec` result of this expression
     */
    Channel: /<#(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a role mention
     *
     * The `id` group property is present on the `exec` result of this expression
     */
    Role: /<@&(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a application command mention
     *
     * The `fullName` (possibly including `name`, `subcommandOrGroup` and `subcommand`) and `id` group properties are present on the `exec` result of this expression
     */
    SlashCommand: /<\/(?<fullName>(?<name>[\w-]{1,32})(?: (?<subcommandOrGroup>[\w-]{1,32}))?(?: (?<subcommand>[\w-]{1,32}))?):(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a custom emoji, either static or animated
     *
     * The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
     */
    Emoji: /<(?<animated>a)?:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching strictly an animated custom emoji
     *
     * The `animated`, `name` and `id` group properties are present on the `exec` result of this expression
     */
    AnimatedEmoji: /<(?<animated>a):(?<name>\w{2,32}):(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching strictly a static custom emoji
     *
     * The `name` and `id` group properties are present on the `exec` result of this expression
     */
    StaticEmoji: /<:(?<name>\w{2,32}):(?<id>\d{17,20})>/,
    /**
     * Regular expression for matching a timestamp, either default or custom styled
     *
     * The `timestamp` and `style` group properties are present on the `exec` result of this expression
     */
    Timestamp: /<t:(?<timestamp>-?\d{1,13})(:(?<style>[tTdDfFR]))?>/,
    /**
     * Regular expression for matching strictly default styled timestamps
     *
     * The `timestamp` group property is present on the `exec` result of this expression
     */
    DefaultStyledTimestamp: /<t:(?<timestamp>-?\d{1,13})>/,
    /**
     * Regular expression for matching strictly custom styled timestamps
     *
     * The `timestamp` and `style` group properties are present on the `exec` result of this expression
     */
    StyledTimestamp: /<t:(?<timestamp>-?\d{1,13}):(?<style>[tTdDfFR])>/,
};
/**
 * Freezes the formatting patterns
 * @internal
 */
Object.freeze(exports.FormattingPatterns);
//# sourceMappingURL=globals.js.map

/***/ }),

/***/ 5888:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionFlagsBits = void 0;
/**
 * https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
 *
 * These flags are exported as `BigInt`s and NOT numbers. Wrapping them in `Number()`
 * may cause issues, try to use BigInts as much as possible or modules that can
 * replicate them in some way
 */
exports.PermissionFlagsBits = {
    CreateInstantInvite: 1n << 0n,
    KickMembers: 1n << 1n,
    BanMembers: 1n << 2n,
    Administrator: 1n << 3n,
    ManageChannels: 1n << 4n,
    ManageGuild: 1n << 5n,
    AddReactions: 1n << 6n,
    ViewAuditLog: 1n << 7n,
    PrioritySpeaker: 1n << 8n,
    Stream: 1n << 9n,
    ViewChannel: 1n << 10n,
    SendMessages: 1n << 11n,
    SendTTSMessages: 1n << 12n,
    ManageMessages: 1n << 13n,
    EmbedLinks: 1n << 14n,
    AttachFiles: 1n << 15n,
    ReadMessageHistory: 1n << 16n,
    MentionEveryone: 1n << 17n,
    UseExternalEmojis: 1n << 18n,
    ViewGuildInsights: 1n << 19n,
    Connect: 1n << 20n,
    Speak: 1n << 21n,
    MuteMembers: 1n << 22n,
    DeafenMembers: 1n << 23n,
    MoveMembers: 1n << 24n,
    UseVAD: 1n << 25n,
    ChangeNickname: 1n << 26n,
    ManageNicknames: 1n << 27n,
    ManageRoles: 1n << 28n,
    ManageWebhooks: 1n << 29n,
    ManageEmojisAndStickers: 1n << 30n,
    UseApplicationCommands: 1n << 31n,
    RequestToSpeak: 1n << 32n,
    ManageEvents: 1n << 33n,
    ManageThreads: 1n << 34n,
    CreatePublicThreads: 1n << 35n,
    CreatePrivateThreads: 1n << 36n,
    UseExternalStickers: 1n << 37n,
    SendMessagesInThreads: 1n << 38n,
    UseEmbeddedActivities: 1n << 39n,
    ModerateMembers: 1n << 40n,
};
/**
 * Freeze the object of bits, preventing any modifications to it
 * @internal
 */
Object.freeze(exports.PermissionFlagsBits);
//# sourceMappingURL=common.js.map

/***/ }),

/***/ 1510:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=attachment.js.map

/***/ }),

/***/ 4163:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 370:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=boolean.js.map

/***/ }),

/***/ 5123:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=channel.js.map

/***/ }),

/***/ 4873:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=integer.js.map

/***/ }),

/***/ 3636:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=mentionable.js.map

/***/ }),

/***/ 7055:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=number.js.map

/***/ }),

/***/ 5214:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=role.js.map

/***/ }),

/***/ 2179:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationCommandOptionType = void 0;
/**
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
 */
var ApplicationCommandOptionType;
(function (ApplicationCommandOptionType) {
    ApplicationCommandOptionType[ApplicationCommandOptionType["Subcommand"] = 1] = "Subcommand";
    ApplicationCommandOptionType[ApplicationCommandOptionType["SubcommandGroup"] = 2] = "SubcommandGroup";
    ApplicationCommandOptionType[ApplicationCommandOptionType["String"] = 3] = "String";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Integer"] = 4] = "Integer";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Boolean"] = 5] = "Boolean";
    ApplicationCommandOptionType[ApplicationCommandOptionType["User"] = 6] = "User";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Channel"] = 7] = "Channel";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Role"] = 8] = "Role";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Mentionable"] = 9] = "Mentionable";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Number"] = 10] = "Number";
    ApplicationCommandOptionType[ApplicationCommandOptionType["Attachment"] = 11] = "Attachment";
})(ApplicationCommandOptionType = exports.ApplicationCommandOptionType || (exports.ApplicationCommandOptionType = {}));
//# sourceMappingURL=shared.js.map

/***/ }),

/***/ 8145:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=string.js.map

/***/ }),

/***/ 3799:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=subcommand.js.map

/***/ }),

/***/ 9110:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=subcommandGroup.js.map

/***/ }),

/***/ 9195:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=user.js.map

/***/ }),

/***/ 7666:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(1510), exports);
__exportStar(__nccwpck_require__(4163), exports);
__exportStar(__nccwpck_require__(370), exports);
__exportStar(__nccwpck_require__(5123), exports);
__exportStar(__nccwpck_require__(4873), exports);
__exportStar(__nccwpck_require__(3636), exports);
__exportStar(__nccwpck_require__(7055), exports);
__exportStar(__nccwpck_require__(5214), exports);
__exportStar(__nccwpck_require__(2179), exports);
__exportStar(__nccwpck_require__(8145), exports);
__exportStar(__nccwpck_require__(3799), exports);
__exportStar(__nccwpck_require__(9110), exports);
__exportStar(__nccwpck_require__(9195), exports);
//# sourceMappingURL=chatInput.js.map

/***/ }),

/***/ 2167:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=contextMenu.js.map

/***/ }),

/***/ 7750:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.APIApplicationCommandPermissionsConstant = exports.ApplicationCommandPermissionType = void 0;
/**
 * https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type
 */
var ApplicationCommandPermissionType;
(function (ApplicationCommandPermissionType) {
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["Role"] = 1] = "Role";
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["User"] = 2] = "User";
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["Channel"] = 3] = "Channel";
})(ApplicationCommandPermissionType = exports.ApplicationCommandPermissionType || (exports.ApplicationCommandPermissionType = {}));
/**
 * https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-constants
 */
exports.APIApplicationCommandPermissionsConstant = {
    Everyone: (guildId) => String(guildId),
    AllChannels: (guildId) => String(BigInt(guildId) - 1n),
};
//# sourceMappingURL=permissions.js.map

/***/ }),

/***/ 6684:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationCommandType = void 0;
__exportStar(__nccwpck_require__(7666), exports);
__exportStar(__nccwpck_require__(2167), exports);
__exportStar(__nccwpck_require__(7750), exports);
/**
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
 */
var ApplicationCommandType;
(function (ApplicationCommandType) {
    ApplicationCommandType[ApplicationCommandType["ChatInput"] = 1] = "ChatInput";
    ApplicationCommandType[ApplicationCommandType["User"] = 2] = "User";
    ApplicationCommandType[ApplicationCommandType["Message"] = 3] = "Message";
})(ApplicationCommandType = exports.ApplicationCommandType || (exports.ApplicationCommandType = {}));
//# sourceMappingURL=applicationCommands.js.map

/***/ }),

/***/ 6287:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=autocomplete.js.map

/***/ }),

/***/ 4383:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 7268:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=messageComponents.js.map

/***/ }),

/***/ 1098:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=modalSubmit.js.map

/***/ }),

/***/ 8728:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=ping.js.map

/***/ }),

/***/ 1633:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InteractionResponseType = exports.InteractionType = void 0;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type
 */
var InteractionType;
(function (InteractionType) {
    InteractionType[InteractionType["Ping"] = 1] = "Ping";
    InteractionType[InteractionType["ApplicationCommand"] = 2] = "ApplicationCommand";
    InteractionType[InteractionType["MessageComponent"] = 3] = "MessageComponent";
    InteractionType[InteractionType["ApplicationCommandAutocomplete"] = 4] = "ApplicationCommandAutocomplete";
    InteractionType[InteractionType["ModalSubmit"] = 5] = "ModalSubmit";
})(InteractionType = exports.InteractionType || (exports.InteractionType = {}));
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type
 */
var InteractionResponseType;
(function (InteractionResponseType) {
    /**
     * ACK a `Ping`
     */
    InteractionResponseType[InteractionResponseType["Pong"] = 1] = "Pong";
    /**
     * Respond to an interaction with a message
     */
    InteractionResponseType[InteractionResponseType["ChannelMessageWithSource"] = 4] = "ChannelMessageWithSource";
    /**
     * ACK an interaction and edit to a response later, the user sees a loading state
     */
    InteractionResponseType[InteractionResponseType["DeferredChannelMessageWithSource"] = 5] = "DeferredChannelMessageWithSource";
    /**
     * ACK a button interaction and update it to a loading state
     */
    InteractionResponseType[InteractionResponseType["DeferredMessageUpdate"] = 6] = "DeferredMessageUpdate";
    /**
     * ACK a button interaction and edit the message to which the button was attached
     */
    InteractionResponseType[InteractionResponseType["UpdateMessage"] = 7] = "UpdateMessage";
    /**
     * For autocomplete interactions
     */
    InteractionResponseType[InteractionResponseType["ApplicationCommandAutocompleteResult"] = 8] = "ApplicationCommandAutocompleteResult";
    /**
     * Respond to an interaction with an modal for a user to fill-out
     */
    InteractionResponseType[InteractionResponseType["Modal"] = 9] = "Modal";
})(InteractionResponseType = exports.InteractionResponseType || (exports.InteractionResponseType = {}));
//# sourceMappingURL=responses.js.map

/***/ }),

/***/ 3890:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/application
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationFlags = void 0;
/**
 * https://discord.com/developers/docs/resources/application#application-object-application-flags
 */
var ApplicationFlags;
(function (ApplicationFlags) {
    ApplicationFlags[ApplicationFlags["EmbeddedReleased"] = 2] = "EmbeddedReleased";
    ApplicationFlags[ApplicationFlags["ManagedEmoji"] = 4] = "ManagedEmoji";
    ApplicationFlags[ApplicationFlags["GroupDMCreate"] = 16] = "GroupDMCreate";
    ApplicationFlags[ApplicationFlags["RPCHasConnected"] = 2048] = "RPCHasConnected";
    ApplicationFlags[ApplicationFlags["GatewayPresence"] = 4096] = "GatewayPresence";
    ApplicationFlags[ApplicationFlags["GatewayPresenceLimited"] = 8192] = "GatewayPresenceLimited";
    ApplicationFlags[ApplicationFlags["GatewayGuildMembers"] = 16384] = "GatewayGuildMembers";
    ApplicationFlags[ApplicationFlags["GatewayGuildMembersLimited"] = 32768] = "GatewayGuildMembersLimited";
    ApplicationFlags[ApplicationFlags["VerificationPendingGuildLimit"] = 65536] = "VerificationPendingGuildLimit";
    ApplicationFlags[ApplicationFlags["Embedded"] = 131072] = "Embedded";
    ApplicationFlags[ApplicationFlags["GatewayMessageContent"] = 262144] = "GatewayMessageContent";
    ApplicationFlags[ApplicationFlags["GatewayMessageContentLimited"] = 524288] = "GatewayMessageContentLimited";
    ApplicationFlags[ApplicationFlags["EmbeddedFirstParty"] = 1048576] = "EmbeddedFirstParty";
    ApplicationFlags[ApplicationFlags["ApplicationCommandBadge"] = 8388608] = "ApplicationCommandBadge";
})(ApplicationFlags = exports.ApplicationFlags || (exports.ApplicationFlags = {}));
//# sourceMappingURL=application.js.map

/***/ }),

/***/ 7484:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/audit-log
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditLogOptionsType = exports.AuditLogEvent = void 0;
/**
 * https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events
 */
var AuditLogEvent;
(function (AuditLogEvent) {
    AuditLogEvent[AuditLogEvent["GuildUpdate"] = 1] = "GuildUpdate";
    AuditLogEvent[AuditLogEvent["ChannelCreate"] = 10] = "ChannelCreate";
    AuditLogEvent[AuditLogEvent["ChannelUpdate"] = 11] = "ChannelUpdate";
    AuditLogEvent[AuditLogEvent["ChannelDelete"] = 12] = "ChannelDelete";
    AuditLogEvent[AuditLogEvent["ChannelOverwriteCreate"] = 13] = "ChannelOverwriteCreate";
    AuditLogEvent[AuditLogEvent["ChannelOverwriteUpdate"] = 14] = "ChannelOverwriteUpdate";
    AuditLogEvent[AuditLogEvent["ChannelOverwriteDelete"] = 15] = "ChannelOverwriteDelete";
    AuditLogEvent[AuditLogEvent["MemberKick"] = 20] = "MemberKick";
    AuditLogEvent[AuditLogEvent["MemberPrune"] = 21] = "MemberPrune";
    AuditLogEvent[AuditLogEvent["MemberBanAdd"] = 22] = "MemberBanAdd";
    AuditLogEvent[AuditLogEvent["MemberBanRemove"] = 23] = "MemberBanRemove";
    AuditLogEvent[AuditLogEvent["MemberUpdate"] = 24] = "MemberUpdate";
    AuditLogEvent[AuditLogEvent["MemberRoleUpdate"] = 25] = "MemberRoleUpdate";
    AuditLogEvent[AuditLogEvent["MemberMove"] = 26] = "MemberMove";
    AuditLogEvent[AuditLogEvent["MemberDisconnect"] = 27] = "MemberDisconnect";
    AuditLogEvent[AuditLogEvent["BotAdd"] = 28] = "BotAdd";
    AuditLogEvent[AuditLogEvent["RoleCreate"] = 30] = "RoleCreate";
    AuditLogEvent[AuditLogEvent["RoleUpdate"] = 31] = "RoleUpdate";
    AuditLogEvent[AuditLogEvent["RoleDelete"] = 32] = "RoleDelete";
    AuditLogEvent[AuditLogEvent["InviteCreate"] = 40] = "InviteCreate";
    AuditLogEvent[AuditLogEvent["InviteUpdate"] = 41] = "InviteUpdate";
    AuditLogEvent[AuditLogEvent["InviteDelete"] = 42] = "InviteDelete";
    AuditLogEvent[AuditLogEvent["WebhookCreate"] = 50] = "WebhookCreate";
    AuditLogEvent[AuditLogEvent["WebhookUpdate"] = 51] = "WebhookUpdate";
    AuditLogEvent[AuditLogEvent["WebhookDelete"] = 52] = "WebhookDelete";
    AuditLogEvent[AuditLogEvent["EmojiCreate"] = 60] = "EmojiCreate";
    AuditLogEvent[AuditLogEvent["EmojiUpdate"] = 61] = "EmojiUpdate";
    AuditLogEvent[AuditLogEvent["EmojiDelete"] = 62] = "EmojiDelete";
    AuditLogEvent[AuditLogEvent["MessageDelete"] = 72] = "MessageDelete";
    AuditLogEvent[AuditLogEvent["MessageBulkDelete"] = 73] = "MessageBulkDelete";
    AuditLogEvent[AuditLogEvent["MessagePin"] = 74] = "MessagePin";
    AuditLogEvent[AuditLogEvent["MessageUnpin"] = 75] = "MessageUnpin";
    AuditLogEvent[AuditLogEvent["IntegrationCreate"] = 80] = "IntegrationCreate";
    AuditLogEvent[AuditLogEvent["IntegrationUpdate"] = 81] = "IntegrationUpdate";
    AuditLogEvent[AuditLogEvent["IntegrationDelete"] = 82] = "IntegrationDelete";
    AuditLogEvent[AuditLogEvent["StageInstanceCreate"] = 83] = "StageInstanceCreate";
    AuditLogEvent[AuditLogEvent["StageInstanceUpdate"] = 84] = "StageInstanceUpdate";
    AuditLogEvent[AuditLogEvent["StageInstanceDelete"] = 85] = "StageInstanceDelete";
    AuditLogEvent[AuditLogEvent["StickerCreate"] = 90] = "StickerCreate";
    AuditLogEvent[AuditLogEvent["StickerUpdate"] = 91] = "StickerUpdate";
    AuditLogEvent[AuditLogEvent["StickerDelete"] = 92] = "StickerDelete";
    AuditLogEvent[AuditLogEvent["GuildScheduledEventCreate"] = 100] = "GuildScheduledEventCreate";
    AuditLogEvent[AuditLogEvent["GuildScheduledEventUpdate"] = 101] = "GuildScheduledEventUpdate";
    AuditLogEvent[AuditLogEvent["GuildScheduledEventDelete"] = 102] = "GuildScheduledEventDelete";
    AuditLogEvent[AuditLogEvent["ThreadCreate"] = 110] = "ThreadCreate";
    AuditLogEvent[AuditLogEvent["ThreadUpdate"] = 111] = "ThreadUpdate";
    AuditLogEvent[AuditLogEvent["ThreadDelete"] = 112] = "ThreadDelete";
    AuditLogEvent[AuditLogEvent["ApplicationCommandPermissionUpdate"] = 121] = "ApplicationCommandPermissionUpdate";
})(AuditLogEvent = exports.AuditLogEvent || (exports.AuditLogEvent = {}));
var AuditLogOptionsType;
(function (AuditLogOptionsType) {
    AuditLogOptionsType["Role"] = "0";
    AuditLogOptionsType["Member"] = "1";
})(AuditLogOptionsType = exports.AuditLogOptionsType || (exports.AuditLogOptionsType = {}));
//# sourceMappingURL=auditLog.js.map

/***/ }),

/***/ 5159:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/channel
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChannelFlags = exports.TextInputStyle = exports.ButtonStyle = exports.ComponentType = exports.AllowedMentionsTypes = exports.EmbedType = exports.ThreadMemberFlags = exports.ThreadAutoArchiveDuration = exports.OverwriteType = exports.MessageFlags = exports.MessageActivityType = exports.MessageType = exports.VideoQualityMode = exports.ChannelType = void 0;
/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
var ChannelType;
(function (ChannelType) {
    /**
     * A text channel within a guild
     */
    ChannelType[ChannelType["GuildText"] = 0] = "GuildText";
    /**
     * A direct message between users
     */
    ChannelType[ChannelType["DM"] = 1] = "DM";
    /**
     * A voice channel within a guild
     */
    ChannelType[ChannelType["GuildVoice"] = 2] = "GuildVoice";
    /**
     * A direct message between multiple users
     */
    ChannelType[ChannelType["GroupDM"] = 3] = "GroupDM";
    /**
     * An organizational category that contains up to 50 channels
     *
     * See https://support.discord.com/hc/en-us/articles/115001580171-Channel-Categories-101
     */
    ChannelType[ChannelType["GuildCategory"] = 4] = "GuildCategory";
    /**
     * A channel that users can follow and crosspost into their own guild
     *
     * See https://support.discord.com/hc/en-us/articles/360032008192
     */
    ChannelType[ChannelType["GuildAnnouncement"] = 5] = "GuildAnnouncement";
    /**
     * A temporary sub-channel within a Guild Announcement channel
     */
    ChannelType[ChannelType["AnnouncementThread"] = 10] = "AnnouncementThread";
    /**
     * A temporary sub-channel within a Guild Text channel
     */
    ChannelType[ChannelType["PublicThread"] = 11] = "PublicThread";
    /**
     * A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
     */
    ChannelType[ChannelType["PrivateThread"] = 12] = "PrivateThread";
    /**
     * A voice channel for hosting events with an audience
     *
     * See https://support.discord.com/hc/en-us/articles/1500005513722
     */
    ChannelType[ChannelType["GuildStageVoice"] = 13] = "GuildStageVoice";
    /**
     * The channel in a Student Hub containing the listed servers
     *
     * See https://support.discord.com/hc/en-us/articles/4406046651927-Discord-Student-Hubs-FAQ
     */
    ChannelType[ChannelType["GuildDirectory"] = 14] = "GuildDirectory";
    /**
     * A channel that can only contain threads
     */
    ChannelType[ChannelType["GuildForum"] = 15] = "GuildForum";
    // EVERYTHING BELOW THIS LINE SHOULD BE OLD NAMES FOR RENAMED ENUM MEMBERS //
    /**
     * A channel that users can follow and crosspost into their own guild
     *
     * @deprecated This is the old name for {@apilink ChannelType#GuildAnnouncement}
     *
     * See https://support.discord.com/hc/en-us/articles/360032008192
     */
    ChannelType[ChannelType["GuildNews"] = 5] = "GuildNews";
    /**
     * A temporary sub-channel within a Guild Announcement channel
     *
     * @deprecated This is the old name for {@apilink ChannelType#AnnouncementThread}
     */
    ChannelType[ChannelType["GuildNewsThread"] = 10] = "GuildNewsThread";
    /**
     * A temporary sub-channel within a Guild Text channel
     *
     * @deprecated This is the old name for {@apilink ChannelType#PublicThread}
     */
    ChannelType[ChannelType["GuildPublicThread"] = 11] = "GuildPublicThread";
    /**
     * A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
     *
     * @deprecated This is the old name for {@apilink ChannelType#PrivateThread}
     */
    ChannelType[ChannelType["GuildPrivateThread"] = 12] = "GuildPrivateThread";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
var VideoQualityMode;
(function (VideoQualityMode) {
    /**
     * Discord chooses the quality for optimal performance
     */
    VideoQualityMode[VideoQualityMode["Auto"] = 1] = "Auto";
    /**
     * 720p
     */
    VideoQualityMode[VideoQualityMode["Full"] = 2] = "Full";
})(VideoQualityMode = exports.VideoQualityMode || (exports.VideoQualityMode = {}));
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-types
 */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Default"] = 0] = "Default";
    MessageType[MessageType["RecipientAdd"] = 1] = "RecipientAdd";
    MessageType[MessageType["RecipientRemove"] = 2] = "RecipientRemove";
    MessageType[MessageType["Call"] = 3] = "Call";
    MessageType[MessageType["ChannelNameChange"] = 4] = "ChannelNameChange";
    MessageType[MessageType["ChannelIconChange"] = 5] = "ChannelIconChange";
    MessageType[MessageType["ChannelPinnedMessage"] = 6] = "ChannelPinnedMessage";
    MessageType[MessageType["UserJoin"] = 7] = "UserJoin";
    MessageType[MessageType["GuildBoost"] = 8] = "GuildBoost";
    MessageType[MessageType["GuildBoostTier1"] = 9] = "GuildBoostTier1";
    MessageType[MessageType["GuildBoostTier2"] = 10] = "GuildBoostTier2";
    MessageType[MessageType["GuildBoostTier3"] = 11] = "GuildBoostTier3";
    MessageType[MessageType["ChannelFollowAdd"] = 12] = "ChannelFollowAdd";
    MessageType[MessageType["GuildDiscoveryDisqualified"] = 14] = "GuildDiscoveryDisqualified";
    MessageType[MessageType["GuildDiscoveryRequalified"] = 15] = "GuildDiscoveryRequalified";
    MessageType[MessageType["GuildDiscoveryGracePeriodInitialWarning"] = 16] = "GuildDiscoveryGracePeriodInitialWarning";
    MessageType[MessageType["GuildDiscoveryGracePeriodFinalWarning"] = 17] = "GuildDiscoveryGracePeriodFinalWarning";
    MessageType[MessageType["ThreadCreated"] = 18] = "ThreadCreated";
    MessageType[MessageType["Reply"] = 19] = "Reply";
    MessageType[MessageType["ChatInputCommand"] = 20] = "ChatInputCommand";
    MessageType[MessageType["ThreadStarterMessage"] = 21] = "ThreadStarterMessage";
    MessageType[MessageType["GuildInviteReminder"] = 22] = "GuildInviteReminder";
    MessageType[MessageType["ContextMenuCommand"] = 23] = "ContextMenuCommand";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-activity-types
 */
var MessageActivityType;
(function (MessageActivityType) {
    MessageActivityType[MessageActivityType["Join"] = 1] = "Join";
    MessageActivityType[MessageActivityType["Spectate"] = 2] = "Spectate";
    MessageActivityType[MessageActivityType["Listen"] = 3] = "Listen";
    MessageActivityType[MessageActivityType["JoinRequest"] = 5] = "JoinRequest";
})(MessageActivityType = exports.MessageActivityType || (exports.MessageActivityType = {}));
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-flags
 */
var MessageFlags;
(function (MessageFlags) {
    /**
     * This message has been published to subscribed channels (via Channel Following)
     */
    MessageFlags[MessageFlags["Crossposted"] = 1] = "Crossposted";
    /**
     * This message originated from a message in another channel (via Channel Following)
     */
    MessageFlags[MessageFlags["IsCrosspost"] = 2] = "IsCrosspost";
    /**
     * Do not include any embeds when serializing this message
     */
    MessageFlags[MessageFlags["SuppressEmbeds"] = 4] = "SuppressEmbeds";
    /**
     * The source message for this crosspost has been deleted (via Channel Following)
     */
    MessageFlags[MessageFlags["SourceMessageDeleted"] = 8] = "SourceMessageDeleted";
    /**
     * This message came from the urgent message system
     */
    MessageFlags[MessageFlags["Urgent"] = 16] = "Urgent";
    /**
     * This message has an associated thread, which shares its id
     */
    MessageFlags[MessageFlags["HasThread"] = 32] = "HasThread";
    /**
     * This message is only visible to the user who invoked the Interaction
     */
    MessageFlags[MessageFlags["Ephemeral"] = 64] = "Ephemeral";
    /**
     * This message is an Interaction Response and the bot is "thinking"
     */
    MessageFlags[MessageFlags["Loading"] = 128] = "Loading";
    /**
     * This message failed to mention some roles and add their members to the thread
     */
    MessageFlags[MessageFlags["FailedToMentionSomeRolesInThread"] = 256] = "FailedToMentionSomeRolesInThread";
})(MessageFlags = exports.MessageFlags || (exports.MessageFlags = {}));
var OverwriteType;
(function (OverwriteType) {
    OverwriteType[OverwriteType["Role"] = 0] = "Role";
    OverwriteType[OverwriteType["Member"] = 1] = "Member";
})(OverwriteType = exports.OverwriteType || (exports.OverwriteType = {}));
var ThreadAutoArchiveDuration;
(function (ThreadAutoArchiveDuration) {
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneHour"] = 60] = "OneHour";
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneDay"] = 1440] = "OneDay";
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["ThreeDays"] = 4320] = "ThreeDays";
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneWeek"] = 10080] = "OneWeek";
})(ThreadAutoArchiveDuration = exports.ThreadAutoArchiveDuration || (exports.ThreadAutoArchiveDuration = {}));
var ThreadMemberFlags;
(function (ThreadMemberFlags) {
})(ThreadMemberFlags = exports.ThreadMemberFlags || (exports.ThreadMemberFlags = {}));
/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-types
 * @deprecated *Embed types should be considered deprecated and might be removed in a future API version*
 */
var EmbedType;
(function (EmbedType) {
    /**
     * Generic embed rendered from embed attributes
     */
    EmbedType["Rich"] = "rich";
    /**
     * Image embed
     */
    EmbedType["Image"] = "image";
    /**
     * Video embed
     */
    EmbedType["Video"] = "video";
    /**
     * Animated gif image embed rendered as a video embed
     */
    EmbedType["GIFV"] = "gifv";
    /**
     * Article embed
     */
    EmbedType["Article"] = "article";
    /**
     * Link embed
     */
    EmbedType["Link"] = "link";
})(EmbedType = exports.EmbedType || (exports.EmbedType = {}));
/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types
 */
var AllowedMentionsTypes;
(function (AllowedMentionsTypes) {
    /**
     * Controls @everyone and @here mentions
     */
    AllowedMentionsTypes["Everyone"] = "everyone";
    /**
     * Controls role mentions
     */
    AllowedMentionsTypes["Role"] = "roles";
    /**
     * Controls user mentions
     */
    AllowedMentionsTypes["User"] = "users";
})(AllowedMentionsTypes = exports.AllowedMentionsTypes || (exports.AllowedMentionsTypes = {}));
/**
 * https://discord.com/developers/docs/interactions/message-components#component-object-component-types
 */
var ComponentType;
(function (ComponentType) {
    /**
     * Action Row component
     */
    ComponentType[ComponentType["ActionRow"] = 1] = "ActionRow";
    /**
     * Button component
     */
    ComponentType[ComponentType["Button"] = 2] = "Button";
    /**
     * Select Menu component
     */
    ComponentType[ComponentType["SelectMenu"] = 3] = "SelectMenu";
    /**
     * Text Input component
     */
    ComponentType[ComponentType["TextInput"] = 4] = "TextInput";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
/**
 * https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
 */
var ButtonStyle;
(function (ButtonStyle) {
    ButtonStyle[ButtonStyle["Primary"] = 1] = "Primary";
    ButtonStyle[ButtonStyle["Secondary"] = 2] = "Secondary";
    ButtonStyle[ButtonStyle["Success"] = 3] = "Success";
    ButtonStyle[ButtonStyle["Danger"] = 4] = "Danger";
    ButtonStyle[ButtonStyle["Link"] = 5] = "Link";
})(ButtonStyle = exports.ButtonStyle || (exports.ButtonStyle = {}));
/**
 * https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-styles
 */
var TextInputStyle;
(function (TextInputStyle) {
    TextInputStyle[TextInputStyle["Short"] = 1] = "Short";
    TextInputStyle[TextInputStyle["Paragraph"] = 2] = "Paragraph";
})(TextInputStyle = exports.TextInputStyle || (exports.TextInputStyle = {}));
/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-flags
 */
var ChannelFlags;
(function (ChannelFlags) {
    ChannelFlags[ChannelFlags["Pinned"] = 2] = "Pinned";
})(ChannelFlags = exports.ChannelFlags || (exports.ChannelFlags = {}));
//# sourceMappingURL=channel.js.map

/***/ }),

/***/ 7850:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/emoji
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=emoji.js.map

/***/ }),

/***/ 2310:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/topics/gateway
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityFlags = exports.ActivityType = exports.ActivityPlatform = exports.PresenceUpdateStatus = void 0;
var PresenceUpdateStatus;
(function (PresenceUpdateStatus) {
    PresenceUpdateStatus["Online"] = "online";
    PresenceUpdateStatus["DoNotDisturb"] = "dnd";
    PresenceUpdateStatus["Idle"] = "idle";
    /**
     * Invisible and shown as offline
     */
    PresenceUpdateStatus["Invisible"] = "invisible";
    PresenceUpdateStatus["Offline"] = "offline";
})(PresenceUpdateStatus = exports.PresenceUpdateStatus || (exports.PresenceUpdateStatus = {}));
/**
 * @unstable This enum is currently not documented by Discord but has known values which we will try to keep up to date.
 * Values might be added or removed without a major version bump.
 */
var ActivityPlatform;
(function (ActivityPlatform) {
    ActivityPlatform["Desktop"] = "desktop";
    ActivityPlatform["Xbox"] = "xbox";
    ActivityPlatform["Samsung"] = "samsung";
    ActivityPlatform["IOS"] = "ios";
    ActivityPlatform["Android"] = "android";
    ActivityPlatform["Embedded"] = "embedded";
    ActivityPlatform["PS4"] = "ps4";
    ActivityPlatform["PS5"] = "ps5";
})(ActivityPlatform = exports.ActivityPlatform || (exports.ActivityPlatform = {}));
/**
 * https://discord.com/developers/docs/topics/gateway#activity-object-activity-types
 */
var ActivityType;
(function (ActivityType) {
    /**
     * Playing {game}
     */
    ActivityType[ActivityType["Playing"] = 0] = "Playing";
    /**
     * Streaming {details}
     */
    ActivityType[ActivityType["Streaming"] = 1] = "Streaming";
    /**
     * Listening to {name}
     */
    ActivityType[ActivityType["Listening"] = 2] = "Listening";
    /**
     * Watching {details}
     */
    ActivityType[ActivityType["Watching"] = 3] = "Watching";
    /**
     * {emoji} {details}
     */
    ActivityType[ActivityType["Custom"] = 4] = "Custom";
    /**
     * Competing in {name}
     */
    ActivityType[ActivityType["Competing"] = 5] = "Competing";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
/**
 * https://discord.com/developers/docs/topics/gateway#activity-object-activity-flags
 */
var ActivityFlags;
(function (ActivityFlags) {
    ActivityFlags[ActivityFlags["Instance"] = 1] = "Instance";
    ActivityFlags[ActivityFlags["Join"] = 2] = "Join";
    ActivityFlags[ActivityFlags["Spectate"] = 4] = "Spectate";
    ActivityFlags[ActivityFlags["JoinRequest"] = 8] = "JoinRequest";
    ActivityFlags[ActivityFlags["Sync"] = 16] = "Sync";
    ActivityFlags[ActivityFlags["Play"] = 32] = "Play";
    ActivityFlags[ActivityFlags["PartyPrivacyFriends"] = 64] = "PartyPrivacyFriends";
    ActivityFlags[ActivityFlags["PartyPrivacyVoiceChannel"] = 128] = "PartyPrivacyVoiceChannel";
    ActivityFlags[ActivityFlags["Embedded"] = 256] = "Embedded";
})(ActivityFlags = exports.ActivityFlags || (exports.ActivityFlags = {}));
//# sourceMappingURL=gateway.js.map

/***/ }),

/***/ 1484:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/guild
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MembershipScreeningFieldType = exports.GuildWidgetStyle = exports.IntegrationExpireBehavior = exports.GuildFeature = exports.GuildSystemChannelFlags = exports.GuildHubType = exports.GuildPremiumTier = exports.GuildVerificationLevel = exports.GuildNSFWLevel = exports.GuildMFALevel = exports.GuildExplicitContentFilter = exports.GuildDefaultMessageNotifications = void 0;
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
 */
var GuildDefaultMessageNotifications;
(function (GuildDefaultMessageNotifications) {
    GuildDefaultMessageNotifications[GuildDefaultMessageNotifications["AllMessages"] = 0] = "AllMessages";
    GuildDefaultMessageNotifications[GuildDefaultMessageNotifications["OnlyMentions"] = 1] = "OnlyMentions";
})(GuildDefaultMessageNotifications = exports.GuildDefaultMessageNotifications || (exports.GuildDefaultMessageNotifications = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level
 */
var GuildExplicitContentFilter;
(function (GuildExplicitContentFilter) {
    GuildExplicitContentFilter[GuildExplicitContentFilter["Disabled"] = 0] = "Disabled";
    GuildExplicitContentFilter[GuildExplicitContentFilter["MembersWithoutRoles"] = 1] = "MembersWithoutRoles";
    GuildExplicitContentFilter[GuildExplicitContentFilter["AllMembers"] = 2] = "AllMembers";
})(GuildExplicitContentFilter = exports.GuildExplicitContentFilter || (exports.GuildExplicitContentFilter = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-mfa-level
 */
var GuildMFALevel;
(function (GuildMFALevel) {
    GuildMFALevel[GuildMFALevel["None"] = 0] = "None";
    GuildMFALevel[GuildMFALevel["Elevated"] = 1] = "Elevated";
})(GuildMFALevel = exports.GuildMFALevel || (exports.GuildMFALevel = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level
 */
var GuildNSFWLevel;
(function (GuildNSFWLevel) {
    GuildNSFWLevel[GuildNSFWLevel["Default"] = 0] = "Default";
    GuildNSFWLevel[GuildNSFWLevel["Explicit"] = 1] = "Explicit";
    GuildNSFWLevel[GuildNSFWLevel["Safe"] = 2] = "Safe";
    GuildNSFWLevel[GuildNSFWLevel["AgeRestricted"] = 3] = "AgeRestricted";
})(GuildNSFWLevel = exports.GuildNSFWLevel || (exports.GuildNSFWLevel = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-verification-level
 */
var GuildVerificationLevel;
(function (GuildVerificationLevel) {
    /**
     * Unrestricted
     */
    GuildVerificationLevel[GuildVerificationLevel["None"] = 0] = "None";
    /**
     * Must have verified email on account
     */
    GuildVerificationLevel[GuildVerificationLevel["Low"] = 1] = "Low";
    /**
     * Must be registered on Discord for longer than 5 minutes
     */
    GuildVerificationLevel[GuildVerificationLevel["Medium"] = 2] = "Medium";
    /**
     * Must be a member of the guild for longer than 10 minutes
     */
    GuildVerificationLevel[GuildVerificationLevel["High"] = 3] = "High";
    /**
     * Must have a verified phone number
     */
    GuildVerificationLevel[GuildVerificationLevel["VeryHigh"] = 4] = "VeryHigh";
})(GuildVerificationLevel = exports.GuildVerificationLevel || (exports.GuildVerificationLevel = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
 */
var GuildPremiumTier;
(function (GuildPremiumTier) {
    GuildPremiumTier[GuildPremiumTier["None"] = 0] = "None";
    GuildPremiumTier[GuildPremiumTier["Tier1"] = 1] = "Tier1";
    GuildPremiumTier[GuildPremiumTier["Tier2"] = 2] = "Tier2";
    GuildPremiumTier[GuildPremiumTier["Tier3"] = 3] = "Tier3";
})(GuildPremiumTier = exports.GuildPremiumTier || (exports.GuildPremiumTier = {}));
var GuildHubType;
(function (GuildHubType) {
    GuildHubType[GuildHubType["Default"] = 0] = "Default";
    GuildHubType[GuildHubType["HighSchool"] = 1] = "HighSchool";
    GuildHubType[GuildHubType["College"] = 2] = "College";
})(GuildHubType = exports.GuildHubType || (exports.GuildHubType = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags
 */
var GuildSystemChannelFlags;
(function (GuildSystemChannelFlags) {
    /**
     * Suppress member join notifications
     */
    GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressJoinNotifications"] = 1] = "SuppressJoinNotifications";
    /**
     * Suppress server boost notifications
     */
    GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressPremiumSubscriptions"] = 2] = "SuppressPremiumSubscriptions";
    /**
     * Suppress server setup tips
     */
    GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressGuildReminderNotifications"] = 4] = "SuppressGuildReminderNotifications";
    /**
     * Hide member join sticker reply buttons
     */
    GuildSystemChannelFlags[GuildSystemChannelFlags["SuppressJoinNotificationReplies"] = 8] = "SuppressJoinNotificationReplies";
})(GuildSystemChannelFlags = exports.GuildSystemChannelFlags || (exports.GuildSystemChannelFlags = {}));
/**
 * https://discord.com/developers/docs/resources/guild#guild-object-guild-features
 */
var GuildFeature;
(function (GuildFeature) {
    /**
     * Guild has access to set an animated guild banner image
     */
    GuildFeature["AnimatedBanner"] = "ANIMATED_BANNER";
    /**
     * Guild has access to set an animated guild icon
     */
    GuildFeature["AnimatedIcon"] = "ANIMATED_ICON";
    /**
     * Guild has access to set a guild banner image
     */
    GuildFeature["Banner"] = "BANNER";
    /**
     * Guild can enable welcome screen, Membership Screening and discovery, and receives community updates
     */
    GuildFeature["Community"] = "COMMUNITY";
    /**
     * Guild is able to be discovered in the directory
     */
    GuildFeature["Discoverable"] = "DISCOVERABLE";
    /**
     * Guild is able to be featured in the directory
     */
    GuildFeature["Featurable"] = "FEATURABLE";
    /**
     * Guild is listed in a directory channel
     */
    GuildFeature["HasDirectoryEntry"] = "HAS_DIRECTORY_ENTRY";
    /**
     * Guild is a Student Hub
     *
     * See https://support.discord.com/hc/en-us/articles/4406046651927-Discord-Student-Hubs-FAQ
     *
     * @unstable This feature is currently not documented by Discord, but has known value
     */
    GuildFeature["Hub"] = "HUB";
    /**
     * Guild has disabled invite usage, preventing users from joining
     */
    GuildFeature["InvitesDisabled"] = "INVITES_DISABLED";
    /**
     * Guild has access to set an invite splash background
     */
    GuildFeature["InviteSplash"] = "INVITE_SPLASH";
    /**
     * Guild is in a Student Hub
     *
     * See https://support.discord.com/hc/en-us/articles/4406046651927-Discord-Student-Hubs-FAQ
     *
     * @unstable This feature is currently not documented by Discord, but has known value
     */
    GuildFeature["LinkedToHub"] = "LINKED_TO_HUB";
    /**
     * Guild has enabled Membership Screening
     */
    GuildFeature["MemberVerificationGateEnabled"] = "MEMBER_VERIFICATION_GATE_ENABLED";
    /**
     * Guild has enabled monetization
     */
    GuildFeature["MonetizationEnabled"] = "MONETIZATION_ENABLED";
    /**
     * Guild has increased custom sticker slots
     */
    GuildFeature["MoreStickers"] = "MORE_STICKERS";
    /**
     * Guild has access to create news channels
     */
    GuildFeature["News"] = "NEWS";
    /**
     * Guild is partnered
     */
    GuildFeature["Partnered"] = "PARTNERED";
    /**
     * Guild can be previewed before joining via Membership Screening or the directory
     */
    GuildFeature["PreviewEnabled"] = "PREVIEW_ENABLED";
    /**
     * Guild has access to create private threads
     */
    GuildFeature["PrivateThreads"] = "PRIVATE_THREADS";
    GuildFeature["RelayEnabled"] = "RELAY_ENABLED";
    /**
     * Guild is able to set role icons
     */
    GuildFeature["RoleIcons"] = "ROLE_ICONS";
    /**
     * Guild has enabled ticketed events
     */
    GuildFeature["TicketedEventsEnabled"] = "TICKETED_EVENTS_ENABLED";
    /**
     * Guild has access to set a vanity URL
     */
    GuildFeature["VanityURL"] = "VANITY_URL";
    /**
     * Guild is verified
     */
    GuildFeature["Verified"] = "VERIFIED";
    /**
     * Guild has access to set 384kbps bitrate in voice (previously VIP voice servers)
     */
    GuildFeature["VIPRegions"] = "VIP_REGIONS";
    /**
     * Guild has enabled the welcome screen
     */
    GuildFeature["WelcomeScreenEnabled"] = "WELCOME_SCREEN_ENABLED";
})(GuildFeature = exports.GuildFeature || (exports.GuildFeature = {}));
/**
 * https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors
 */
var IntegrationExpireBehavior;
(function (IntegrationExpireBehavior) {
    IntegrationExpireBehavior[IntegrationExpireBehavior["RemoveRole"] = 0] = "RemoveRole";
    IntegrationExpireBehavior[IntegrationExpireBehavior["Kick"] = 1] = "Kick";
})(IntegrationExpireBehavior = exports.IntegrationExpireBehavior || (exports.IntegrationExpireBehavior = {}));
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options
 */
var GuildWidgetStyle;
(function (GuildWidgetStyle) {
    /**
     * Shield style widget with Discord icon and guild members online count
     */
    GuildWidgetStyle["Shield"] = "shield";
    /**
     * Large image with guild icon, name and online count. "POWERED BY DISCORD" as the footer of the widget
     */
    GuildWidgetStyle["Banner1"] = "banner1";
    /**
     * Smaller widget style with guild icon, name and online count. Split on the right with Discord logo
     */
    GuildWidgetStyle["Banner2"] = "banner2";
    /**
     * Large image with guild icon, name and online count. In the footer, Discord logo on the left and "Chat Now" on the right
     */
    GuildWidgetStyle["Banner3"] = "banner3";
    /**
     * Large Discord logo at the top of the widget. Guild icon, name and online count in the middle portion of the widget
     * and a "JOIN MY SERVER" button at the bottom
     */
    GuildWidgetStyle["Banner4"] = "banner4";
})(GuildWidgetStyle = exports.GuildWidgetStyle || (exports.GuildWidgetStyle = {}));
var MembershipScreeningFieldType;
(function (MembershipScreeningFieldType) {
    /**
     * Server Rules
     */
    MembershipScreeningFieldType["Terms"] = "TERMS";
})(MembershipScreeningFieldType = exports.MembershipScreeningFieldType || (exports.MembershipScreeningFieldType = {}));
//# sourceMappingURL=guild.js.map

/***/ }),

/***/ 1859:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GuildScheduledEventPrivacyLevel = exports.GuildScheduledEventStatus = exports.GuildScheduledEventEntityType = void 0;
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types
 */
var GuildScheduledEventEntityType;
(function (GuildScheduledEventEntityType) {
    GuildScheduledEventEntityType[GuildScheduledEventEntityType["StageInstance"] = 1] = "StageInstance";
    GuildScheduledEventEntityType[GuildScheduledEventEntityType["Voice"] = 2] = "Voice";
    GuildScheduledEventEntityType[GuildScheduledEventEntityType["External"] = 3] = "External";
})(GuildScheduledEventEntityType = exports.GuildScheduledEventEntityType || (exports.GuildScheduledEventEntityType = {}));
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status
 */
var GuildScheduledEventStatus;
(function (GuildScheduledEventStatus) {
    GuildScheduledEventStatus[GuildScheduledEventStatus["Scheduled"] = 1] = "Scheduled";
    GuildScheduledEventStatus[GuildScheduledEventStatus["Active"] = 2] = "Active";
    GuildScheduledEventStatus[GuildScheduledEventStatus["Completed"] = 3] = "Completed";
    GuildScheduledEventStatus[GuildScheduledEventStatus["Canceled"] = 4] = "Canceled";
})(GuildScheduledEventStatus = exports.GuildScheduledEventStatus || (exports.GuildScheduledEventStatus = {}));
/**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level
 */
var GuildScheduledEventPrivacyLevel;
(function (GuildScheduledEventPrivacyLevel) {
    /**
     * The scheduled event is only accessible to guild members
     */
    GuildScheduledEventPrivacyLevel[GuildScheduledEventPrivacyLevel["GuildOnly"] = 2] = "GuildOnly";
})(GuildScheduledEventPrivacyLevel = exports.GuildScheduledEventPrivacyLevel || (exports.GuildScheduledEventPrivacyLevel = {}));
//# sourceMappingURL=guildScheduledEvent.js.map

/***/ }),

/***/ 7771:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(5888), exports);
__exportStar(__nccwpck_require__(3890), exports);
__exportStar(__nccwpck_require__(7484), exports);
__exportStar(__nccwpck_require__(5159), exports);
__exportStar(__nccwpck_require__(7850), exports);
__exportStar(__nccwpck_require__(2310), exports);
__exportStar(__nccwpck_require__(1484), exports);
__exportStar(__nccwpck_require__(1859), exports);
__exportStar(__nccwpck_require__(5489), exports);
__exportStar(__nccwpck_require__(5613), exports);
__exportStar(__nccwpck_require__(4737), exports);
__exportStar(__nccwpck_require__(6682), exports);
__exportStar(__nccwpck_require__(567), exports);
__exportStar(__nccwpck_require__(7342), exports);
__exportStar(__nccwpck_require__(4145), exports);
__exportStar(__nccwpck_require__(2126), exports);
__exportStar(__nccwpck_require__(5874), exports);
__exportStar(__nccwpck_require__(6918), exports);
__exportStar(__nccwpck_require__(7588), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5489:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(6684), exports);
__exportStar(__nccwpck_require__(6287), exports);
__exportStar(__nccwpck_require__(4383), exports);
__exportStar(__nccwpck_require__(7268), exports);
__exportStar(__nccwpck_require__(1098), exports);
__exportStar(__nccwpck_require__(8728), exports);
__exportStar(__nccwpck_require__(1633), exports);
//# sourceMappingURL=interactions.js.map

/***/ }),

/***/ 5613:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/invite
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InviteTargetType = void 0;
/**
 * https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types
 */
var InviteTargetType;
(function (InviteTargetType) {
    InviteTargetType[InviteTargetType["Stream"] = 1] = "Stream";
    InviteTargetType[InviteTargetType["EmbeddedApplication"] = 2] = "EmbeddedApplication";
})(InviteTargetType = exports.InviteTargetType || (exports.InviteTargetType = {}));
//# sourceMappingURL=invite.js.map

/***/ }),

/***/ 4737:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/topics/oauth2
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OAuth2Scopes = void 0;
var OAuth2Scopes;
(function (OAuth2Scopes) {
    /**
     * For oauth2 bots, this puts the bot in the user's selected guild by default
     */
    OAuth2Scopes["Bot"] = "bot";
    /**
     * Allows [/users/@me/connections](https://discord.com/developers/docs/resources/user#get-user-connections)
     * to return linked third-party accounts
     *
     * See https://discord.com/developers/docs/resources/user#get-user-connections
     */
    OAuth2Scopes["Connections"] = "connections";
    /**
     * Allows your app to see information about the user's DMs and group DMs - requires Discord approval
     */
    OAuth2Scopes["DMChannelsRead"] = "dm_channels.read";
    /**
     * Enables [/users/@me](https://discord.com/developers/docs/resources/user#get-current-user) to return an `email`
     *
     * See https://discord.com/developers/docs/resources/user#get-current-user
     */
    OAuth2Scopes["Email"] = "email";
    /**
     * Allows [/users/@me](https://discord.com/developers/docs/resources/user#get-current-user) without `email`
     *
     * See https://discord.com/developers/docs/resources/user#get-current-user
     */
    OAuth2Scopes["Identify"] = "identify";
    /**
     * Allows [/users/@me/guilds](https://discord.com/developers/docs/resources/user#get-current-user-guilds)
     * to return basic information about all of a user's guilds
     *
     * See https://discord.com/developers/docs/resources/user#get-current-user-guilds
     */
    OAuth2Scopes["Guilds"] = "guilds";
    /**
     * Allows [/guilds/{guild.id}/members/{user.id}](https://discord.com/developers/docs/resources/guild#add-guild-member)
     * to be used for joining users to a guild
     *
     * See https://discord.com/developers/docs/resources/guild#add-guild-member
     */
    OAuth2Scopes["GuildsJoin"] = "guilds.join";
    /**
     * Allows /users/@me/guilds/{guild.id}/member to return a user's member information in a guild
     *
     * See https://discord.com/developers/docs/resources/user#get-current-user-guild-member
     */
    OAuth2Scopes["GuildsMembersRead"] = "guilds.members.read";
    /**
     * Allows your app to join users to a group dm
     *
     * See https://discord.com/developers/docs/resources/channel#group-dm-add-recipient
     */
    OAuth2Scopes["GroupDMJoins"] = "gdm.join";
    /**
     * For local rpc server api access, this allows you to read messages from all client channels
     * (otherwise restricted to channels/guilds your app creates)
     */
    OAuth2Scopes["MessagesRead"] = "messages.read";
    /**
     * For local rpc server access, this allows you to control a user's local Discord client - requires Discord approval
     */
    OAuth2Scopes["RPC"] = "rpc";
    /**
     * For local rpc server api access, this allows you to receive notifications pushed out to the user - requires Discord approval
     */
    OAuth2Scopes["RPCNotificationsRead"] = "rpc.notifications.read";
    /**
     * This generates a webhook that is returned in the oauth token response for authorization code grants
     */
    OAuth2Scopes["WebhookIncoming"] = "webhook.incoming";
    /**
     * Allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval
     */
    OAuth2Scopes["Voice"] = "voice";
    /**
     * Allows your app to upload/update builds for a user's applications - requires Discord approval
     */
    OAuth2Scopes["ApplicationsBuildsUpload"] = "applications.builds.upload";
    /**
     * Allows your app to read build data for a user's applications
     */
    OAuth2Scopes["ApplicationsBuildsRead"] = "applications.builds.read";
    /**
     * Allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications
     */
    OAuth2Scopes["ApplicationsStoreUpdate"] = "applications.store.update";
    /**
     * Allows your app to read entitlements for a user's applications
     */
    OAuth2Scopes["ApplicationsEntitlements"] = "applications.entitlements";
    /**
     * Allows your app to know a user's friends and implicit relationships - requires Discord approval
     */
    OAuth2Scopes["RelationshipsRead"] = "relationships.read";
    /**
     * Allows your app to fetch data from a user's "Now Playing/Recently Played" list - requires Discord approval
     */
    OAuth2Scopes["ActivitiesRead"] = "activities.read";
    /**
     * Allows your app to update a user's activity - requires Discord approval (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER)
     *
     * See https://discord.com/developers/docs/game-sdk/activities
     */
    OAuth2Scopes["ActivitiesWrite"] = "activities.write";
    /**
     * Allows your app to use Application Commands in a guild
     *
     * See https://discord.com/developers/docs/interactions/application-commands
     */
    OAuth2Scopes["ApplicationsCommands"] = "applications.commands";
    /**
     * Allows your app to update its Application Commands via this bearer token - client credentials grant only
     *
     * See https://discord.com/developers/docs/interactions/application-commands
     */
    OAuth2Scopes["ApplicationsCommandsUpdate"] = "applications.commands.update";
    /**
     * Allows your app to update permissions for its commands using a Bearer token - client credentials grant only
     *
     * See https://discord.com/developers/docs/interactions/application-commands
     */
    OAuth2Scopes["ApplicationCommandsPermissionsUpdate"] = "applications.commands.permissions.update";
})(OAuth2Scopes = exports.OAuth2Scopes || (exports.OAuth2Scopes = {}));
//# sourceMappingURL=oauth2.js.map

/***/ }),

/***/ 6682:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/topics/permissions
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=permissions.js.map

/***/ }),

/***/ 567:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StageInstancePrivacyLevel = void 0;
/**
 * https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level
 */
var StageInstancePrivacyLevel;
(function (StageInstancePrivacyLevel) {
    /**
     * The stage instance is visible publicly, such as on stage discovery
     */
    StageInstancePrivacyLevel[StageInstancePrivacyLevel["Public"] = 1] = "Public";
    /**
     * The stage instance is visible to only guild members
     */
    StageInstancePrivacyLevel[StageInstancePrivacyLevel["GuildOnly"] = 2] = "GuildOnly";
})(StageInstancePrivacyLevel = exports.StageInstancePrivacyLevel || (exports.StageInstancePrivacyLevel = {}));
//# sourceMappingURL=stageInstance.js.map

/***/ }),

/***/ 7342:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/sticker
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StickerFormatType = exports.StickerType = void 0;
/**
 * https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types
 */
var StickerType;
(function (StickerType) {
    /**
     * An official sticker in a pack, part of Nitro or in a removed purchasable pack
     */
    StickerType[StickerType["Standard"] = 1] = "Standard";
    /**
     * A sticker uploaded to a Boosted guild for the guild's members
     */
    StickerType[StickerType["Guild"] = 2] = "Guild";
})(StickerType = exports.StickerType || (exports.StickerType = {}));
/**
 * https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types
 */
var StickerFormatType;
(function (StickerFormatType) {
    StickerFormatType[StickerFormatType["PNG"] = 1] = "PNG";
    StickerFormatType[StickerFormatType["APNG"] = 2] = "APNG";
    StickerFormatType[StickerFormatType["Lottie"] = 3] = "Lottie";
})(StickerFormatType = exports.StickerFormatType || (exports.StickerFormatType = {}));
//# sourceMappingURL=sticker.js.map

/***/ }),

/***/ 4145:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/topics/teams
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TeamMemberMembershipState = void 0;
/**
 * https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum
 */
var TeamMemberMembershipState;
(function (TeamMemberMembershipState) {
    TeamMemberMembershipState[TeamMemberMembershipState["Invited"] = 1] = "Invited";
    TeamMemberMembershipState[TeamMemberMembershipState["Accepted"] = 2] = "Accepted";
})(TeamMemberMembershipState = exports.TeamMemberMembershipState || (exports.TeamMemberMembershipState = {}));
//# sourceMappingURL=teams.js.map

/***/ }),

/***/ 2126:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/guild-template
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=template.js.map

/***/ }),

/***/ 5874:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/user
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConnectionVisibility = exports.ConnectionService = exports.UserPremiumType = exports.UserFlags = void 0;
/**
 * https://discord.com/developers/docs/resources/user#user-object-user-flags
 */
var UserFlags;
(function (UserFlags) {
    /**
     * Discord Employee
     */
    UserFlags[UserFlags["Staff"] = 1] = "Staff";
    /**
     * Partnered Server Owner
     */
    UserFlags[UserFlags["Partner"] = 2] = "Partner";
    /**
     * HypeSquad Events Member
     */
    UserFlags[UserFlags["Hypesquad"] = 4] = "Hypesquad";
    /**
     * Bug Hunter Level 1
     */
    UserFlags[UserFlags["BugHunterLevel1"] = 8] = "BugHunterLevel1";
    /**
     * House Bravery Member
     */
    UserFlags[UserFlags["HypeSquadOnlineHouse1"] = 64] = "HypeSquadOnlineHouse1";
    /**
     * House Brilliance Member
     */
    UserFlags[UserFlags["HypeSquadOnlineHouse2"] = 128] = "HypeSquadOnlineHouse2";
    /**
     * House Balance Member
     */
    UserFlags[UserFlags["HypeSquadOnlineHouse3"] = 256] = "HypeSquadOnlineHouse3";
    /**
     * Early Nitro Supporter
     */
    UserFlags[UserFlags["PremiumEarlySupporter"] = 512] = "PremiumEarlySupporter";
    /**
     * User is a [team](https://discord.com/developers/docs/topics/teams)
     */
    UserFlags[UserFlags["TeamPseudoUser"] = 1024] = "TeamPseudoUser";
    /**
     * Bug Hunter Level 2
     */
    UserFlags[UserFlags["BugHunterLevel2"] = 16384] = "BugHunterLevel2";
    /**
     * Verified Bot
     */
    UserFlags[UserFlags["VerifiedBot"] = 65536] = "VerifiedBot";
    /**
     * Early Verified Bot Developer
     */
    UserFlags[UserFlags["VerifiedDeveloper"] = 131072] = "VerifiedDeveloper";
    /**
     * Discord Certified Moderator
     */
    UserFlags[UserFlags["CertifiedModerator"] = 262144] = "CertifiedModerator";
    /**
     * Bot uses only [HTTP interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction) and is shown in the online member list
     */
    UserFlags[UserFlags["BotHTTPInteractions"] = 524288] = "BotHTTPInteractions";
    /**
     * User has been identified as spammer
     *
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    UserFlags[UserFlags["Spammer"] = 1048576] = "Spammer";
    /**
     * User's account has been quarantined based on recent activity
     *
     * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
     */
    UserFlags[UserFlags["Quarantined"] = Math.pow(2, 44)] = "Quarantined";
})(UserFlags = exports.UserFlags || (exports.UserFlags = {}));
/**
 * https://discord.com/developers/docs/resources/user#user-object-premium-types
 */
var UserPremiumType;
(function (UserPremiumType) {
    UserPremiumType[UserPremiumType["None"] = 0] = "None";
    UserPremiumType[UserPremiumType["NitroClassic"] = 1] = "NitroClassic";
    UserPremiumType[UserPremiumType["Nitro"] = 2] = "Nitro";
})(UserPremiumType = exports.UserPremiumType || (exports.UserPremiumType = {}));
var ConnectionService;
(function (ConnectionService) {
    ConnectionService["BattleNet"] = "battlenet";
    ConnectionService["EpicGames"] = "epicgames";
    ConnectionService["Facebook"] = "facebook";
    ConnectionService["GitHub"] = "github";
    ConnectionService["LeagueOfLegends"] = "leagueoflegends";
    ConnectionService["PlayStationNetwork"] = "playstation";
    ConnectionService["Reddit"] = "reddit";
    ConnectionService["SamsungGalaxy"] = "samsunggalaxy";
    ConnectionService["Spotify"] = "spotify";
    ConnectionService["Skype"] = "skype";
    ConnectionService["Steam"] = "steam";
    ConnectionService["Twitch"] = "twitch";
    ConnectionService["Twitter"] = "twitter";
    ConnectionService["Xbox"] = "xbox";
    ConnectionService["YouTube"] = "youtube";
})(ConnectionService = exports.ConnectionService || (exports.ConnectionService = {}));
var ConnectionVisibility;
(function (ConnectionVisibility) {
    /**
     * Invisible to everyone except the user themselves
     */
    ConnectionVisibility[ConnectionVisibility["None"] = 0] = "None";
    /**
     * Visible to everyone
     */
    ConnectionVisibility[ConnectionVisibility["Everyone"] = 1] = "Everyone";
})(ConnectionVisibility = exports.ConnectionVisibility || (exports.ConnectionVisibility = {}));
//# sourceMappingURL=user.js.map

/***/ }),

/***/ 6918:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/voice
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=voice.js.map

/***/ }),

/***/ 7588:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Types extracted from https://discord.com/developers/docs/resources/webhook
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebhookType = void 0;
var WebhookType;
(function (WebhookType) {
    /**
     * Incoming Webhooks can post messages to channels with a generated token
     */
    WebhookType[WebhookType["Incoming"] = 1] = "Incoming";
    /**
     * Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels
     */
    WebhookType[WebhookType["ChannelFollower"] = 2] = "ChannelFollower";
    /**
     * Application webhooks are webhooks used with Interactions
     */
    WebhookType[WebhookType["Application"] = 3] = "Application";
})(WebhookType = exports.WebhookType || (exports.WebhookType = {}));
//# sourceMappingURL=webhook.js.map

/***/ }),

/***/ 9508:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Locale = exports.RESTJSONErrorCodes = void 0;
/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes
 */
var RESTJSONErrorCodes;
(function (RESTJSONErrorCodes) {
    RESTJSONErrorCodes[RESTJSONErrorCodes["GeneralError"] = 0] = "GeneralError";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownAccount"] = 10001] = "UnknownAccount";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownApplication"] = 10002] = "UnknownApplication";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownChannel"] = 10003] = "UnknownChannel";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuild"] = 10004] = "UnknownGuild";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownIntegration"] = 10005] = "UnknownIntegration";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownInvite"] = 10006] = "UnknownInvite";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownMember"] = 10007] = "UnknownMember";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownMessage"] = 10008] = "UnknownMessage";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownPermissionOverwrite"] = 10009] = "UnknownPermissionOverwrite";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownProvider"] = 10010] = "UnknownProvider";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownRole"] = 10011] = "UnknownRole";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownToken"] = 10012] = "UnknownToken";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownUser"] = 10013] = "UnknownUser";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownEmoji"] = 10014] = "UnknownEmoji";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownWebhook"] = 10015] = "UnknownWebhook";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownWebhookService"] = 10016] = "UnknownWebhookService";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSession"] = 10020] = "UnknownSession";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownBan"] = 10026] = "UnknownBan";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSKU"] = 10027] = "UnknownSKU";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStoreListing"] = 10028] = "UnknownStoreListing";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownEntitlement"] = 10029] = "UnknownEntitlement";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownBuild"] = 10030] = "UnknownBuild";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownLobby"] = 10031] = "UnknownLobby";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownBranch"] = 10032] = "UnknownBranch";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStoreDirectoryLayout"] = 10033] = "UnknownStoreDirectoryLayout";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownRedistributable"] = 10036] = "UnknownRedistributable";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGiftCode"] = 10038] = "UnknownGiftCode";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStream"] = 10049] = "UnknownStream";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownPremiumServerSubscribeCooldown"] = 10050] = "UnknownPremiumServerSubscribeCooldown";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildTemplate"] = 10057] = "UnknownGuildTemplate";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownDiscoverableServerCategory"] = 10059] = "UnknownDiscoverableServerCategory";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownSticker"] = 10060] = "UnknownSticker";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownInteraction"] = 10062] = "UnknownInteraction";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownApplicationCommand"] = 10063] = "UnknownApplicationCommand";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownVoiceState"] = 10065] = "UnknownVoiceState";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownApplicationCommandPermissions"] = 10066] = "UnknownApplicationCommandPermissions";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownStageInstance"] = 10067] = "UnknownStageInstance";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildMemberVerificationForm"] = 10068] = "UnknownGuildMemberVerificationForm";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildWelcomeScreen"] = 10069] = "UnknownGuildWelcomeScreen";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildScheduledEvent"] = 10070] = "UnknownGuildScheduledEvent";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownGuildScheduledEventUser"] = 10071] = "UnknownGuildScheduledEventUser";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnknownTag"] = 10087] = "UnknownTag";
    RESTJSONErrorCodes[RESTJSONErrorCodes["BotsCannotUseThisEndpoint"] = 20001] = "BotsCannotUseThisEndpoint";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OnlyBotsCanUseThisEndpoint"] = 20002] = "OnlyBotsCanUseThisEndpoint";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ExplicitContentCannotBeSentToTheDesiredRecipient"] = 20009] = "ExplicitContentCannotBeSentToTheDesiredRecipient";
    RESTJSONErrorCodes[RESTJSONErrorCodes["NotAuthorizedToPerformThisActionOnThisApplication"] = 20012] = "NotAuthorizedToPerformThisActionOnThisApplication";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ActionCannotBePerformedDueToSlowmodeRateLimit"] = 20016] = "ActionCannotBePerformedDueToSlowmodeRateLimit";
    RESTJSONErrorCodes[RESTJSONErrorCodes["TheMazeIsntMeantForYou"] = 20017] = "TheMazeIsntMeantForYou";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OnlyTheOwnerOfThisAccountCanPerformThisAction"] = 20018] = "OnlyTheOwnerOfThisAccountCanPerformThisAction";
    RESTJSONErrorCodes[RESTJSONErrorCodes["AnnouncementEditLimitExceeded"] = 20022] = "AnnouncementEditLimitExceeded";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UnderMinimumAge"] = 20024] = "UnderMinimumAge";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ChannelSendRateLimit"] = 20028] = "ChannelSendRateLimit";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ServerSendRateLimit"] = 20029] = "ServerSendRateLimit";
    RESTJSONErrorCodes[RESTJSONErrorCodes["StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords"] = 20031] = "StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords";
    RESTJSONErrorCodes[RESTJSONErrorCodes["GuildPremiumSubscriptionLevelTooLow"] = 20035] = "GuildPremiumSubscriptionLevelTooLow";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildsReached"] = 30001] = "MaximumNumberOfGuildsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfFriendsReached"] = 30002] = "MaximumNumberOfFriendsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPinsReachedForTheChannel"] = 30003] = "MaximumNumberOfPinsReachedForTheChannel";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfRecipientsReached"] = 30004] = "MaximumNumberOfRecipientsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildRolesReached"] = 30005] = "MaximumNumberOfGuildRolesReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfWebhooksReached"] = 30007] = "MaximumNumberOfWebhooksReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfEmojisReached"] = 30008] = "MaximumNumberOfEmojisReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfReactionsReached"] = 30010] = "MaximumNumberOfReactionsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildChannelsReached"] = 30013] = "MaximumNumberOfGuildChannelsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfAttachmentsInAMessageReached"] = 30015] = "MaximumNumberOfAttachmentsInAMessageReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfInvitesReached"] = 30016] = "MaximumNumberOfInvitesReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfAnimatedEmojisReached"] = 30018] = "MaximumNumberOfAnimatedEmojisReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfServerMembersReached"] = 30019] = "MaximumNumberOfServerMembersReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfServerCategoriesReached"] = 30030] = "MaximumNumberOfServerCategoriesReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["GuildAlreadyHasTemplate"] = 30031] = "GuildAlreadyHasTemplate";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfApplicationCommandsReached"] = 30032] = "MaximumNumberOfApplicationCommandsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumThreadParticipantsReached"] = 30033] = "MaximumThreadParticipantsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumDailyApplicationCommandCreatesReached"] = 30034] = "MaximumDailyApplicationCommandCreatesReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfNonGuildMemberBansHasBeenExceeded"] = 30035] = "MaximumNumberOfNonGuildMemberBansHasBeenExceeded";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfBanFetchesHasBeenReached"] = 30037] = "MaximumNumberOfBanFetchesHasBeenReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfUncompletedGuildScheduledEventsReached"] = 30038] = "MaximumNumberOfUncompletedGuildScheduledEventsReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfStickersReached"] = 30039] = "MaximumNumberOfStickersReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPruneRequestsHasBeenReached"] = 30040] = "MaximumNumberOfPruneRequestsHasBeenReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached"] = 30042] = "MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfEditsToMessagesOlderThanOneHourReached"] = 30046] = "MaximumNumberOfEditsToMessagesOlderThanOneHourReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfPinnedThreadsInForumHasBeenReached"] = 30047] = "MaximumNumberOfPinnedThreadsInForumHasBeenReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumNumberOfTagsInForumHasBeenReached"] = 30048] = "MaximumNumberOfTagsInForumHasBeenReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["BitrateIsTooHighForChannelOfThisType"] = 30052] = "BitrateIsTooHighForChannelOfThisType";
    RESTJSONErrorCodes[RESTJSONErrorCodes["Unauthorized"] = 40001] = "Unauthorized";
    RESTJSONErrorCodes[RESTJSONErrorCodes["VerifyYourAccount"] = 40002] = "VerifyYourAccount";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OpeningDirectMessagesTooFast"] = 40003] = "OpeningDirectMessagesTooFast";
    RESTJSONErrorCodes[RESTJSONErrorCodes["SendMessagesHasBeenTemporarilyDisabled"] = 40004] = "SendMessagesHasBeenTemporarilyDisabled";
    RESTJSONErrorCodes[RESTJSONErrorCodes["RequestEntityTooLarge"] = 40005] = "RequestEntityTooLarge";
    RESTJSONErrorCodes[RESTJSONErrorCodes["FeatureTemporarilyDisabledServerSide"] = 40006] = "FeatureTemporarilyDisabledServerSide";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UserBannedFromThisGuild"] = 40007] = "UserBannedFromThisGuild";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ConnectionHasBeenRevoked"] = 40012] = "ConnectionHasBeenRevoked";
    RESTJSONErrorCodes[RESTJSONErrorCodes["TargetUserIsNotConnectedToVoice"] = 40032] = "TargetUserIsNotConnectedToVoice";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ThisMessageWasAlreadyCrossposted"] = 40033] = "ThisMessageWasAlreadyCrossposted";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ApplicationCommandWithThatNameAlreadyExists"] = 40041] = "ApplicationCommandWithThatNameAlreadyExists";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ApplicationInteractionFailedToSend"] = 40043] = "ApplicationInteractionFailedToSend";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InteractionHasAlreadyBeenAcknowledged"] = 40060] = "InteractionHasAlreadyBeenAcknowledged";
    RESTJSONErrorCodes[RESTJSONErrorCodes["TagNamesMustBeUnique"] = 40061] = "TagNamesMustBeUnique";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MissingAccess"] = 50001] = "MissingAccess";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidAccountType"] = 50002] = "InvalidAccountType";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExecuteActionOnDMChannel"] = 50003] = "CannotExecuteActionOnDMChannel";
    RESTJSONErrorCodes[RESTJSONErrorCodes["GuildWidgetDisabled"] = 50004] = "GuildWidgetDisabled";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotEditMessageAuthoredByAnotherUser"] = 50005] = "CannotEditMessageAuthoredByAnotherUser";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendAnEmptyMessage"] = 50006] = "CannotSendAnEmptyMessage";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendMessagesToThisUser"] = 50007] = "CannotSendMessagesToThisUser";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSendMessagesInNonTextChannel"] = 50008] = "CannotSendMessagesInNonTextChannel";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ChannelVerificationLevelTooHighForYouToGainAccess"] = 50009] = "ChannelVerificationLevelTooHighForYouToGainAccess";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OAuth2ApplicationDoesNotHaveBot"] = 50010] = "OAuth2ApplicationDoesNotHaveBot";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OAuth2ApplicationLimitReached"] = 50011] = "OAuth2ApplicationLimitReached";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidOAuth2State"] = 50012] = "InvalidOAuth2State";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MissingPermissions"] = 50013] = "MissingPermissions";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidToken"] = 50014] = "InvalidToken";
    RESTJSONErrorCodes[RESTJSONErrorCodes["NoteWasTooLong"] = 50015] = "NoteWasTooLong";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ProvidedTooFewOrTooManyMessagesToDelete"] = 50016] = "ProvidedTooFewOrTooManyMessagesToDelete";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidMFALevel"] = 50017] = "InvalidMFALevel";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MessageCanOnlyBePinnedInTheChannelItWasSentIn"] = 50019] = "MessageCanOnlyBePinnedInTheChannelItWasSentIn";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InviteCodeInvalidOrTaken"] = 50020] = "InviteCodeInvalidOrTaken";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExecuteActionOnSystemMessage"] = 50021] = "CannotExecuteActionOnSystemMessage";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotExecuteActionOnThisChannelType"] = 50024] = "CannotExecuteActionOnThisChannelType";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidOAuth2AccessToken"] = 50025] = "InvalidOAuth2AccessToken";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MissingRequiredOAuth2Scope"] = 50026] = "MissingRequiredOAuth2Scope";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidWebhookToken"] = 50027] = "InvalidWebhookToken";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidRole"] = 50028] = "InvalidRole";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidRecipients"] = 50033] = "InvalidRecipients";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OneOfTheMessagesProvidedWasTooOldForBulkDelete"] = 50034] = "OneOfTheMessagesProvidedWasTooOldForBulkDelete";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidFormBodyOrContentType"] = 50035] = "InvalidFormBodyOrContentType";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InviteAcceptedToGuildWithoutTheBotBeingIn"] = 50036] = "InviteAcceptedToGuildWithoutTheBotBeingIn";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidAPIVersion"] = 50041] = "InvalidAPIVersion";
    RESTJSONErrorCodes[RESTJSONErrorCodes["FileUploadedExceedsMaximumSize"] = 50045] = "FileUploadedExceedsMaximumSize";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidFileUploaded"] = 50046] = "InvalidFileUploaded";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotSelfRedeemThisGift"] = 50054] = "CannotSelfRedeemThisGift";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidGuild"] = 50055] = "InvalidGuild";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidMessageType"] = 50068] = "InvalidMessageType";
    RESTJSONErrorCodes[RESTJSONErrorCodes["PaymentSourceRequiredToRedeemGift"] = 50070] = "PaymentSourceRequiredToRedeemGift";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotDeleteChannelRequiredForCommunityGuilds"] = 50074] = "CannotDeleteChannelRequiredForCommunityGuilds";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotEditStickersWithinMessage"] = 50080] = "CannotEditStickersWithinMessage";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidStickerSent"] = 50081] = "InvalidStickerSent";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidActionOnArchivedThread"] = 50083] = "InvalidActionOnArchivedThread";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidThreadNotificationSettings"] = 50084] = "InvalidThreadNotificationSettings";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ParameterEarlierThanCreation"] = 50085] = "ParameterEarlierThanCreation";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CommunityServerChannelsMustBeTextChannels"] = 50086] = "CommunityServerChannelsMustBeTextChannels";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ServerNotAvailableInYourLocation"] = 50095] = "ServerNotAvailableInYourLocation";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ServerNeedsMonetizationEnabledToPerformThisAction"] = 50097] = "ServerNeedsMonetizationEnabledToPerformThisAction";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ServerNeedsMoreBoostsToPerformThisAction"] = 50101] = "ServerNeedsMoreBoostsToPerformThisAction";
    RESTJSONErrorCodes[RESTJSONErrorCodes["RequestBodyContainsInvalidJSON"] = 50109] = "RequestBodyContainsInvalidJSON";
    RESTJSONErrorCodes[RESTJSONErrorCodes["OwnershipCannotBeMovedToABotUser"] = 50132] = "OwnershipCannotBeMovedToABotUser";
    RESTJSONErrorCodes[RESTJSONErrorCodes["FailedToResizeAssetBelowTheMinimumSize"] = 50138] = "FailedToResizeAssetBelowTheMinimumSize";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UploadedFileNotFound"] = 50146] = "UploadedFileNotFound";
    RESTJSONErrorCodes[RESTJSONErrorCodes["YouDoNotHavePermissionToSendThisSticker"] = 50600] = "YouDoNotHavePermissionToSendThisSticker";
    RESTJSONErrorCodes[RESTJSONErrorCodes["TwoFactorAuthenticationIsRequired"] = 60003] = "TwoFactorAuthenticationIsRequired";
    RESTJSONErrorCodes[RESTJSONErrorCodes["NoUsersWithDiscordTagExist"] = 80004] = "NoUsersWithDiscordTagExist";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ReactionWasBlocked"] = 90001] = "ReactionWasBlocked";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ApplicationNotYetAvailable"] = 110001] = "ApplicationNotYetAvailable";
    RESTJSONErrorCodes[RESTJSONErrorCodes["APIResourceOverloaded"] = 130000] = "APIResourceOverloaded";
    RESTJSONErrorCodes[RESTJSONErrorCodes["TheStageIsAlreadyOpen"] = 150006] = "TheStageIsAlreadyOpen";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotReplyWithoutPermissionToReadMessageHistory"] = 160002] = "CannotReplyWithoutPermissionToReadMessageHistory";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ThreadAlreadyCreatedForMessage"] = 160004] = "ThreadAlreadyCreatedForMessage";
    RESTJSONErrorCodes[RESTJSONErrorCodes["ThreadLocked"] = 160005] = "ThreadLocked";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumActiveThreads"] = 160006] = "MaximumActiveThreads";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MaximumActiveAnnouncementThreads"] = 160007] = "MaximumActiveAnnouncementThreads";
    RESTJSONErrorCodes[RESTJSONErrorCodes["InvalidJSONForUploadedLottieFile"] = 170001] = "InvalidJSONForUploadedLottieFile";
    RESTJSONErrorCodes[RESTJSONErrorCodes["UploadedLottiesCannotContainRasterizedImages"] = 170002] = "UploadedLottiesCannotContainRasterizedImages";
    RESTJSONErrorCodes[RESTJSONErrorCodes["StickerMaximumFramerateExceeded"] = 170003] = "StickerMaximumFramerateExceeded";
    RESTJSONErrorCodes[RESTJSONErrorCodes["StickerFrameCountExceedsMaximumOf1000Frames"] = 170004] = "StickerFrameCountExceedsMaximumOf1000Frames";
    RESTJSONErrorCodes[RESTJSONErrorCodes["LottieAnimationMaximumDimensionsExceeded"] = 170005] = "LottieAnimationMaximumDimensionsExceeded";
    RESTJSONErrorCodes[RESTJSONErrorCodes["StickerFramerateIsTooSmallOrTooLarge"] = 170006] = "StickerFramerateIsTooSmallOrTooLarge";
    RESTJSONErrorCodes[RESTJSONErrorCodes["StickerAnimationDurationExceedsMaximumOf5Seconds"] = 170007] = "StickerAnimationDurationExceedsMaximumOf5Seconds";
    RESTJSONErrorCodes[RESTJSONErrorCodes["CannotUpdateAFinishedEvent"] = 180000] = "CannotUpdateAFinishedEvent";
    RESTJSONErrorCodes[RESTJSONErrorCodes["FailedToCreateStageNeededForStageEvent"] = 180002] = "FailedToCreateStageNeededForStageEvent";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MessageWasBlockedByAutomaticModeration"] = 200000] = "MessageWasBlockedByAutomaticModeration";
    RESTJSONErrorCodes[RESTJSONErrorCodes["TitleWasBlockedByAutomaticModeration"] = 200001] = "TitleWasBlockedByAutomaticModeration";
    RESTJSONErrorCodes[RESTJSONErrorCodes["WebhooksCanOnlyCreateThreadsInForumChannels"] = 220003] = "WebhooksCanOnlyCreateThreadsInForumChannels";
    RESTJSONErrorCodes[RESTJSONErrorCodes["MessageBlockedByHarmfulLinksFilter"] = 240000] = "MessageBlockedByHarmfulLinksFilter";
})(RESTJSONErrorCodes = exports.RESTJSONErrorCodes || (exports.RESTJSONErrorCodes = {}));
/**
 * https://discord.com/developers/docs/reference#locales
 */
var Locale;
(function (Locale) {
    Locale["EnglishUS"] = "en-US";
    Locale["EnglishGB"] = "en-GB";
    Locale["Bulgarian"] = "bg";
    Locale["ChineseCN"] = "zh-CN";
    Locale["ChineseTW"] = "zh-TW";
    Locale["Croatian"] = "hr";
    Locale["Czech"] = "cs";
    Locale["Danish"] = "da";
    Locale["Dutch"] = "nl";
    Locale["Finnish"] = "fi";
    Locale["French"] = "fr";
    Locale["German"] = "de";
    Locale["Greek"] = "el";
    Locale["Hindi"] = "hi";
    Locale["Hungarian"] = "hu";
    Locale["Italian"] = "it";
    Locale["Japanese"] = "ja";
    Locale["Korean"] = "ko";
    Locale["Lithuanian"] = "lt";
    Locale["Norwegian"] = "no";
    Locale["Polish"] = "pl";
    Locale["PortugueseBR"] = "pt-BR";
    Locale["Romanian"] = "ro";
    Locale["Russian"] = "ru";
    Locale["SpanishES"] = "es-ES";
    Locale["Swedish"] = "sv-SE";
    Locale["Thai"] = "th";
    Locale["Turkish"] = "tr";
    Locale["Ukrainian"] = "uk";
    Locale["Vietnamese"] = "vi";
})(Locale = exports.Locale || (exports.Locale = {}));
//# sourceMappingURL=common.js.map

/***/ }),

/***/ 2324:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=auditLog.js.map

/***/ }),

/***/ 6341:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=channel.js.map

/***/ }),

/***/ 1143:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=emoji.js.map

/***/ }),

/***/ 581:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=gateway.js.map

/***/ }),

/***/ 6917:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=guild.js.map

/***/ }),

/***/ 7445:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=guildScheduledEvent.js.map

/***/ }),

/***/ 6206:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OAuth2Routes = exports.RouteBases = exports.ImageFormat = exports.CDNRoutes = exports.StickerPackApplicationId = exports.Routes = exports.APIVersion = void 0;
__exportStar(__nccwpck_require__(9508), exports);
__exportStar(__nccwpck_require__(2324), exports);
__exportStar(__nccwpck_require__(6341), exports);
__exportStar(__nccwpck_require__(1143), exports);
__exportStar(__nccwpck_require__(581), exports);
__exportStar(__nccwpck_require__(6917), exports);
__exportStar(__nccwpck_require__(7445), exports);
__exportStar(__nccwpck_require__(7088), exports);
__exportStar(__nccwpck_require__(8362), exports);
__exportStar(__nccwpck_require__(1987), exports);
__exportStar(__nccwpck_require__(380), exports);
__exportStar(__nccwpck_require__(4129), exports);
__exportStar(__nccwpck_require__(303), exports);
__exportStar(__nccwpck_require__(6562), exports);
__exportStar(__nccwpck_require__(6653), exports);
__exportStar(__nccwpck_require__(8103), exports);
exports.APIVersion = '10';
exports.Routes = {
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/audit-logs`
     */
    guildAuditLog(guildId) {
        return `/guilds/${guildId}/audit-logs`;
    },
    /**
     * Route for:
     * - GET    `/channels/{channel.id}`
     * - PATCH  `/channels/{channel.id}`
     * - DELETE `/channels/{channel.id}`
     */
    channel(channelId) {
        return `/channels/${channelId}`;
    },
    /**
     * Route for:
     * - GET  `/channels/{channel.id}/messages`
     * - POST `/channels/{channel.id}/messages`
     */
    channelMessages(channelId) {
        return `/channels/${channelId}/messages`;
    },
    /**
     * Route for:
     * - GET    `/channels/{channel.id}/messages/{message.id}`
     * - PATCH  `/channels/{channel.id}/messages/{message.id}`
     * - DELETE `/channels/{channel.id}/messages/{message.id}`
     */
    channelMessage(channelId, messageId) {
        return `/channels/${channelId}/messages/${messageId}`;
    },
    /**
     * Route for:
     * - POST `/channels/{channel.id}/messages/{message.id}/crosspost`
     */
    channelMessageCrosspost(channelId, messageId) {
        return `/channels/${channelId}/messages/${messageId}/crosspost`;
    },
    /**
     * Route for:
     * - PUT    `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me`
     * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me`
     *
     * **Note**: You need to URL encode the emoji yourself
     */
    channelMessageOwnReaction(channelId, messageId, emoji) {
        return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`;
    },
    /**
     * Route for:
     * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id}`
     *
     * **Note**: You need to URL encode the emoji yourself
     */
    channelMessageUserReaction(channelId, messageId, emoji, userId) {
        return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}`;
    },
    /**
     * Route for:
     * - GET    `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}`
     * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}`
     *
     * **Note**: You need to URL encode the emoji yourself
     */
    channelMessageReaction(channelId, messageId, emoji) {
        return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}`;
    },
    /**
     * Route for:
     * - DELETE `/channels/{channel.id}/messages/{message.id}/reactions`
     */
    channelMessageAllReactions(channelId, messageId) {
        return `/channels/${channelId}/messages/${messageId}/reactions`;
    },
    /**
     * Route for:
     * - POST `/channels/{channel.id}/messages/bulk-delete`
     */
    channelBulkDelete(channelId) {
        return `/channels/${channelId}/messages/bulk-delete`;
    },
    /**
     * Route for:
     * - PUT    `/channels/{channel.id}/permissions/{overwrite.id}`
     * - DELETE `/channels/{channel.id}/permissions/{overwrite.id}`
     */
    channelPermission(channelId, overwriteId) {
        return `/channels/${channelId}/permissions/${overwriteId}`;
    },
    /**
     * Route for:
     * - GET  `/channels/{channel.id}/invites`
     * - POST `/channels/{channel.id}/invites`
     */
    channelInvites(channelId) {
        return `/channels/${channelId}/invites`;
    },
    /**
     * Route for:
     * - POST `/channels/{channel.id}/followers`
     */
    channelFollowers(channelId) {
        return `/channels/${channelId}/followers`;
    },
    /**
     * Route for:
     * - POST `/channels/{channel.id}/typing`
     */
    channelTyping(channelId) {
        return `/channels/${channelId}/typing`;
    },
    /**
     * Route for:
     * - GET `/channels/{channel.id}/pins`
     */
    channelPins(channelId) {
        return `/channels/${channelId}/pins`;
    },
    /**
     * Route for:
     * - PUT    `/channels/{channel.id}/pins/{message.id}`
     * - DELETE `/channels/{channel.id}/pins/{message.id}`
     */
    channelPin(channelId, messageId) {
        return `/channels/${channelId}/pins/${messageId}`;
    },
    /**
     * Route for:
     * - PUT    `/channels/{channel.id}/recipients/{user.id}`
     * - DELETE `/channels/{channel.id}/recipients/{user.id}`
     */
    channelRecipient(channelId, userId) {
        return `/channels/${channelId}/recipients/${userId}`;
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/emojis`
     * - POST `/guilds/{guild.id}/emojis`
     */
    guildEmojis(guildId) {
        return `/guilds/${guildId}/emojis`;
    },
    /**
     * Route for:
     * - GET    `/guilds/{guild.id}/emojis/{emoji.id}`
     * - PATCH  `/guilds/{guild.id}/emojis/{emoji.id}`
     * - DELETE `/guilds/{guild.id}/emojis/{emoji.id}`
     */
    guildEmoji(guildId, emojiId) {
        return `/guilds/${guildId}/emojis/${emojiId}`;
    },
    /**
     * Route for:
     * - POST `/guilds`
     */
    guilds() {
        return '/guilds';
    },
    /**
     * Route for:
     * - GET    `/guilds/{guild.id}`
     * - PATCH  `/guilds/{guild.id}`
     * - DELETE `/guilds/{guild.id}`
     */
    guild(guildId) {
        return `/guilds/${guildId}`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/preview`
     */
    guildPreview(guildId) {
        return `/guilds/${guildId}/preview`;
    },
    /**
     * Route for:
     * - GET   `/guilds/{guild.id}/channels`
     * - POST  `/guilds/{guild.id}/channels`
     * - PATCH `/guilds/{guild.id}/channels`
     */
    guildChannels(guildId) {
        return `/guilds/${guildId}/channels`;
    },
    /**
     * Route for:
     * - GET    `/guilds/{guild.id}/members/{user.id}`
     * - PUT    `/guilds/{guild.id}/members/{user.id}`
     * - PATCH  `/guilds/{guild.id}/members/@me`
     * - PATCH  `/guilds/{guild.id}/members/{user.id}`
     * - DELETE `/guilds/{guild.id}/members/{user.id}`
     */
    guildMember(guildId, userId = '@me') {
        return `/guilds/${guildId}/members/${userId}`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/members`
     */
    guildMembers(guildId) {
        return `/guilds/${guildId}/members`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/members/search`
     */
    guildMembersSearch(guildId) {
        return `/guilds/${guildId}/members/search`;
    },
    /**
     * Route for:
     * - PATCH `/guilds/{guild.id}/members/@me/nick`
     * @deprecated Use {@link Routes.guildMember} instead.
     */
    guildCurrentMemberNickname(guildId) {
        return `/guilds/${guildId}/members/@me/nick`;
    },
    /**
     * Route for:
     * - PUT    `/guilds/{guild.id}/members/{user.id}/roles/{role.id}`
     * - DELETE `/guilds/{guild.id}/members/{user.id}/roles/{role.id}`
     */
    guildMemberRole(guildId, memberId, roleId) {
        return `/guilds/${guildId}/members/${memberId}/roles/${roleId}`;
    },
    /**
     * Route for:
     * - POST `/guilds/{guild.id}/mfa`
     */
    guildMFA(guildId) {
        return `/guilds/${guildId}/mfa`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/bans`
     */
    guildBans(guildId) {
        return `/guilds/${guildId}/bans`;
    },
    /**
     * Route for:
     * - GET    `/guilds/{guild.id}/bans/{user.id}`
     * - PUT    `/guilds/{guild.id}/bans/{user.id}`
     * - DELETE `/guilds/{guild.id}/bans/{user.id}`
     */
    guildBan(guildId, userId) {
        return `/guilds/${guildId}/bans/${userId}`;
    },
    /**
     * Route for:
     * - GET   `/guilds/{guild.id}/roles`
     * - POST  `/guilds/{guild.id}/roles`
     * - PATCH `/guilds/{guild.id}/roles`
     */
    guildRoles(guildId) {
        return `/guilds/${guildId}/roles`;
    },
    /**
     * Route for:
     * - PATCH  `/guilds/{guild.id}/roles/{role.id}`
     * - DELETE `/guilds/{guild.id}/roles/{role.id}`
     */
    guildRole(guildId, roleId) {
        return `/guilds/${guildId}/roles/${roleId}`;
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/prune`
     * - POST `/guilds/{guild.id}/prune`
     */
    guildPrune(guildId) {
        return `/guilds/${guildId}/prune`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/regions`
     */
    guildVoiceRegions(guildId) {
        return `/guilds/${guildId}/regions`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/invites`
     */
    guildInvites(guildId) {
        return `/guilds/${guildId}/invites`;
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/integrations`
     */
    guildIntegrations(guildId) {
        return `/guilds/${guildId}/integrations`;
    },
    /**
     * Route for:
     * - DELETE `/guilds/{guild.id}/integrations/{integration.id}`
     */
    guildIntegration(guildId, integrationId) {
        return `/guilds/${guildId}/integrations/${integrationId}`;
    },
    /**
     * Route for:
     * - GET   `/guilds/{guild.id}/widget`
     * - PATCH `/guilds/{guild.id}/widget`
     */
    guildWidgetSettings(guildId) {
        return `/guilds/${guildId}/widget`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/widget.json`
     */
    guildWidgetJSON(guildId) {
        return `/guilds/${guildId}/widget.json`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/vanity-url`
     */
    guildVanityUrl(guildId) {
        return `/guilds/${guildId}/vanity-url`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/widget.png`
     */
    guildWidgetImage(guildId) {
        return `/guilds/${guildId}/widget.png`;
    },
    /**
     * Route for:
     * - GET    `/invites/{invite.code}`
     * - DELETE `/invites/{invite.code}`
     */
    invite(code) {
        return `/invites/${code}`;
    },
    /**
     * Route for:
     * - GET  `/guilds/templates/{template.code}`
     * - POST `/guilds/templates/{template.code}`
     */
    template(code) {
        return `/guilds/templates/${code}`;
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/templates`
     * - POST `/guilds/{guild.id}/templates`
     */
    guildTemplates(guildId) {
        return `/guilds/${guildId}/templates`;
    },
    /**
     * Route for:
     * - PUT    `/guilds/{guild.id}/templates/{template.code}`
     * - PATCH  `/guilds/{guild.id}/templates/{template.code}`
     * - DELETE `/guilds/{guild.id}/templates/{template.code}`
     */
    guildTemplate(guildId, code) {
        return `/guilds/${guildId}/templates/${code}`;
    },
    /**
     * Route for:
     * - POST `/channels/{channel.id}/threads`
     * - POST `/channels/{channel.id}/messages/{message.id}/threads`
     */
    threads(parentId, messageId) {
        const parts = ['', 'channels', parentId];
        if (messageId)
            parts.push('messages', messageId);
        parts.push('threads');
        return parts.join('/');
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/threads/active`
     */
    guildActiveThreads(guildId) {
        return `/guilds/${guildId}/threads/active`;
    },
    /**
     * Route for:
     * - GET `/channels/{channel.id}/threads/archived/public`
     * - GET `/channels/{channel.id}/threads/archived/private`
     */
    channelThreads(channelId, archivedStatus) {
        return `/channels/${channelId}/threads/archived/${archivedStatus}`;
    },
    /**
     * Route for:
     * - GET `/channels/{channel.id}/users/@me/threads/archived/prviate`
     */
    channelJoinedArchivedThreads(channelId) {
        return `/channels/${channelId}/users/@me/threads/archived/private`;
    },
    /**
     * Route for:
     * - GET    `/channels/{thread.id}/thread-members`
     * - GET    `/channels/{thread.id}/thread-members/{user.id}`
     * - PUT    `/channels/{thread.id}/thread-members/@me`
     * - PUT    `/channels/{thread.id}/thread-members/{user.id}`
     * - DELETE `/channels/{thread.id}/thread-members/@me`
     * - DELETE `/channels/{thread.id}/thread-members/{user.id}`
     */
    threadMembers(threadId, userId) {
        const parts = ['', 'channels', threadId, 'thread-members'];
        if (userId)
            parts.push(userId);
        return parts.join('/');
    },
    /**
     * Route for:
     * - GET   `/users/@me`
     * - GET   `/users/{user.id}`
     * - PATCH `/users/@me`
     *
     * @param [userId='@me'] The user ID, defaulted to `@me`
     */
    user(userId = '@me') {
        return `/users/${userId}`;
    },
    /**
     * Route for:
     * - GET `/users/@me/guilds`
     */
    userGuilds() {
        return `/users/@me/guilds`;
    },
    /**
     * Route for:
     * - GET `/users/@me/guilds/{guild.id}/member`
     */
    userGuildMember(guildId) {
        return `/users/@me/guilds/${guildId}/member`;
    },
    /**
     * Route for:
     * - DELETE `/users/@me/guilds/{guild.id}`
     */
    userGuild(guildId) {
        return `/users/@me/guilds/${guildId}`;
    },
    /**
     * Route for:
     * - POST `/users/@me/channels`
     */
    userChannels() {
        return `/users/@me/channels`;
    },
    /**
     * Route for:
     * - GET `/users/@me/connections`
     */
    userConnections() {
        return `/users/@me/connections`;
    },
    /**
     * Route for:
     * - GET `/voice/regions`
     */
    voiceRegions() {
        return `/voice/regions`;
    },
    /**
     * Route for:
     * - GET  `/channels/{channel.id}/webhooks`
     * - POST `/channels/{channel.id}/webhooks`
     */
    channelWebhooks(channelId) {
        return `/channels/${channelId}/webhooks`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/webhooks`
     */
    guildWebhooks(guildId) {
        return `/guilds/${guildId}/webhooks`;
    },
    /**
     * Route for:
     * - GET    `/webhooks/{webhook.id}`
     * - GET    `/webhooks/{webhook.id}/{webhook.token}`
     * - PATCH  `/webhooks/{webhook.id}`
     * - PATCH  `/webhooks/{webhook.id}/{webhook.token}`
     * - DELETE `/webhooks/{webhook.id}`
     * - DELETE `/webhooks/{webhook.id}/{webhook.token}`
     * - POST   `/webhooks/{webhook.id}/{webhook.token}`
     *
     * - POST   `/webhooks/{application.id}/{interaction.token}`
     */
    webhook(webhookId, webhookToken) {
        const parts = ['', 'webhooks', webhookId];
        if (webhookToken)
            parts.push(webhookToken);
        return parts.join('/');
    },
    /**
     * Route for:
     * - GET    `/webhooks/{webhook.id}/{webhook.token}/messages/@original`
     * - GET    `/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}`
     * - PATCH  `/webhooks/{webhook.id}/{webhook.token}/messages/@original`
     * - PATCH  `/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}`
     * - DELETE `/webhooks/{webhook.id}/{webhook.token}/messages/@original`
     * - DELETE `/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}`
     *
     * - PATCH  `/webhooks/{application.id}/{interaction.token}/messages/@original`
     * - PATCH  `/webhooks/{application.id}/{interaction.token}/messages/{message.id}`
     * - DELETE `/webhooks/{application.id}/{interaction.token}/messages/{message.id}`
     *
     * @param [messageId='@original'] The message ID to change, defaulted to `@original`
     */
    webhookMessage(webhookId, webhookToken, messageId = '@original') {
        return `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`;
    },
    /**
     * Route for:
     * - POST `/webhooks/{webhook.id}/{webhook.token}/github`
     * - POST `/webhooks/{webhook.id}/{webhook.token}/slack`
     */
    webhookPlatform(webhookId, webhookToken, platform) {
        return `/webhooks/${webhookId}/${webhookToken}/${platform}`;
    },
    /**
     * Route for:
     * - GET `/gateway`
     */
    gateway() {
        return `/gateway`;
    },
    /**
     * Route for:
     * - GET `/gateway/bot`
     */
    gatewayBot() {
        return `/gateway/bot`;
    },
    /**
     * Route for:
     * - GET `/oauth2/applications/@me`
     */
    oauth2CurrentApplication() {
        return `/oauth2/applications/@me`;
    },
    /**
     * Route for:
     * - GET `/oauth2/@me`
     */
    oauth2CurrentAuthorization() {
        return `/oauth2/@me`;
    },
    /**
     * Route for:
     * - GET `/oauth2/authorize`
     */
    oauth2Authorization() {
        return `/oauth2/authorize`;
    },
    /**
     * Route for:
     * - POST `/oauth2/token`
     */
    oauth2TokenExchange() {
        return `/oauth2/token`;
    },
    /**
     * Route for:
     * - POST `/oauth2/token/revoke`
     */
    oauth2TokenRevocation() {
        return `/oauth2/token/revoke`;
    },
    /**
     * Route for:
     * - GET  `/applications/{application.id}/commands`
     * - PUT  `/applications/{application.id}/commands`
     * - POST `/applications/{application.id}/commands`
     */
    applicationCommands(applicationId) {
        return `/applications/${applicationId}/commands`;
    },
    /**
     * Route for:
     * - GET    `/applications/{application.id}/commands/{command.id}`
     * - PATCH  `/applications/{application.id}/commands/{command.id}`
     * - DELETE `/applications/{application.id}/commands/{command.id}`
     */
    applicationCommand(applicationId, commandId) {
        return `/applications/${applicationId}/commands/${commandId}`;
    },
    /**
     * Route for:
     * - GET  `/applications/{application.id}/guilds/{guild.id}/commands`
     * - PUT  `/applications/{application.id}/guilds/{guild.id}/commands`
     * - POST `/applications/{application.id}/guilds/{guild.id}/commands`
     */
    applicationGuildCommands(applicationId, guildId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands`;
    },
    /**
     * Route for:
     * - GET    `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}`
     * - PATCH  `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}`
     * - DELETE `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}`
     */
    applicationGuildCommand(applicationId, guildId, commandId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}`;
    },
    /**
     * Route for:
     * - POST `/interactions/{interaction.id}/{interaction.token}/callback`
     */
    interactionCallback(interactionId, interactionToken) {
        return `/interactions/${interactionId}/${interactionToken}/callback`;
    },
    /**
     * Route for:
     * - GET   `/guilds/{guild.id}/member-verification`
     * - PATCH `/guilds/{guild.id}/member-verification`
     */
    guildMemberVerification(guildId) {
        return `/guilds/${guildId}/member-verification`;
    },
    /**
     * Route for:
     * - PATCH `/guilds/{guild.id}/voice-states/@me`
     * - PATCH `/guilds/{guild.id}/voice-states/{user.id}`
     */
    guildVoiceState(guildId, userId = '@me') {
        return `/guilds/${guildId}/voice-states/${userId}`;
    },
    /**
     * Route for:
     * - GET `/applications/{application.id}/guilds/{guild.id}/commands/permissions`
     * - PUT `/applications/{application.id}/guilds/{guild.id}/commands/permissions`
     */
    guildApplicationCommandsPermissions(applicationId, guildId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands/permissions`;
    },
    /**
     * Route for:
     * - GET `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}/permissions`
     * - PUT `/applications/{application.id}/guilds/{guild.id}/commands/{command.id}/permissions`
     */
    applicationCommandPermissions(applicationId, guildId, commandId) {
        return `/applications/${applicationId}/guilds/${guildId}/commands/${commandId}/permissions`;
    },
    /**
     * Route for:
     * - GET   `/guilds/{guild.id}/welcome-screen`
     * - PATCH `/guilds/{guild.id}/welcome-screen`
     */
    guildWelcomeScreen(guildId) {
        return `/guilds/${guildId}/welcome-screen`;
    },
    /**
     * Route for:
     * - POST `/stage-instances`
     */
    stageInstances() {
        return `/stage-instances`;
    },
    /**
     * Route for:
     * - GET `/stage-instances/{channel.id}`
     * - PATCH `/stage-instances/{channel.id}`
     * - DELETE `/stage-instances/{channel.id}`
     */
    stageInstance(channelId) {
        return `/stage-instances/${channelId}`;
    },
    /**
     * Route for:
     * - GET `/stickers/{sticker.id}`
     */
    sticker(stickerId) {
        return `/stickers/${stickerId}`;
    },
    /**
     * Route for:
     * - GET `/sticker-packs`
     */
    nitroStickerPacks() {
        return '/sticker-packs';
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/stickers`
     * - POST `/guilds/{guild.id}/stickers`
     */
    guildStickers(guildId) {
        return `/guilds/${guildId}/stickers`;
    },
    /**
     * Route for:
     * - GET    `/guilds/{guild.id}/stickers/{sticker.id}`
     * - PATCH  `/guilds/{guild.id}/stickers/{sticker.id}`
     * - DELETE `/guilds/{guild.id}/stickers/{sticker.id}`
     */
    guildSticker(guildId, stickerId) {
        return `/guilds/${guildId}/stickers/${stickerId}`;
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/scheduled-events`
     * - POST `/guilds/{guild.id}/scheduled-events`
     */
    guildScheduledEvents(guildId) {
        return `/guilds/${guildId}/scheduled-events`;
    },
    /**
     * Route for:
     * - GET  `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}`
     * - PATCH `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}`
     * - DELETE `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}`
     */
    guildScheduledEvent(guildId, guildScheduledEventId) {
        return `/guilds/${guildId}/scheduled-events/${guildScheduledEventId}`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/scheduled-events/{guildScheduledEvent.id}/users`
     */
    guildScheduledEventUsers(guildId, guildScheduledEventId) {
        return `/guilds/${guildId}/scheduled-events/${guildScheduledEventId}/users`;
    },
};
exports.StickerPackApplicationId = '710982414301790216';
exports.CDNRoutes = {
    /**
     * Route for:
     * - GET `/emojis/{emoji.id}.{png|jpeg|webp|gif}`
     *
     * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    emoji(emojiId, format) {
        return `/emojis/${emojiId}.${format}`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/icons/{guild.id}.{png|jpeg|webp|gif}`
     *
     * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    guildIcon(guildId, guildIcon, format) {
        return `icons/${guildId}/${guildIcon}.${format}`;
    },
    /**
     * Route for:
     * - GET `/splashes/{guild.id}/{guild.splash}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    guildSplash(guildId, guildSplash, format) {
        return `/splashes/${guildId}/${guildSplash}.${format}`;
    },
    /**
     * Route for:
     * - GET `/discovery-splashes/{guild.id}/{guild.discovery_splash}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    guildDiscoverySplash(guildId, guildDiscoverySplash, format) {
        return `/discovery-splashes/${guildId}/${guildDiscoverySplash}.${format}`;
    },
    /**
     * Route for:
     * - GET `/banners/{guild.id}/{guild.banner}.{png|jpeg|webp|gif}`
     *
     * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    guildBanner(guildId, guildBanner, format) {
        return `/banners/${guildId}/${guildBanner}.${format}`;
    },
    /**
     * Route for:
     * - GET `/banners/{user.id}/{user.banner}.{png|jpeg|webp|gif}`
     *
     * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    userBanner(userId, userBanner, format) {
        return `/banners/${userId}/${userBanner}.${format}`;
    },
    /**
     * Route for:
     * - GET `/embed/avatars/{user.discriminator % 5}.png`
     *
     * The `userDiscriminator` parameter should be the user discriminator modulo 5 (e.g. 1337 % 5 = 2)
     *
     * This route supports the extension: PNG
     */
    defaultUserAvatar(userDiscriminator) {
        return `/embed/avatars/${userDiscriminator}.png`;
    },
    /**
     * Route for:
     * - GET `/avatars/{user.id}/{user.avatar}.{png|jpeg|webp|gif}`
     *
     * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    userAvatar(userId, userAvatar, format) {
        return `/avatars/${userId}/${userAvatar}.${format}`;
    },
    /**
     * Route for:
     * - GET `/guilds/{guild.id}/users/{user.id}/{guild_member.avatar}.{png|jpeg|webp|gif}`
     *
     * As this route supports GIFs, the hash will begin with `a_` if it is available in GIF format
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    guildMemberAvatar(guildId, userId, memberAvatar, format) {
        return `/guilds/${guildId}/users/${userId}/avatars/${memberAvatar}.${format}`;
    },
    /**
     * Route for:
     * - GET `/app-icons/{application.id}/{application.icon}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    applicationIcon(applicationId, applicationIcon, format) {
        return `/app-icons/${applicationId}/${applicationIcon}.${format}`;
    },
    /**
     * Route for:
     * - GET `/app-icons/{application.id}/{application.cover_image}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    applicationCover(applicationId, applicationCoverImage, format) {
        return `/app-icons/${applicationId}/${applicationCoverImage}.${format}`;
    },
    /**
     * Route for:
     * - GET `/app-icons/{application.id}/{application.asset_id}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    applicationAsset(applicationId, applicationAssetId, format) {
        return `/app-icons/${applicationId}/${applicationAssetId}.${format}`;
    },
    /**
     * Route for:
     * - GET `/app-assets/{application.id}/achievements/{achievement.id}/icons/{achievement.icon}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    achievementIcon(applicationId, achievementId, achievementIconHash, format) {
        return `/app-assets/${applicationId}/achievements/${achievementId}/icons/${achievementIconHash}.${format}`;
    },
    /**
     * Route for:
     * - GET `/app-assets/710982414301790216/store/{sticker_pack.banner.asset_id}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    stickerPackBanner(stickerPackBannerAssetId, format) {
        return `/app-assets/${exports.StickerPackApplicationId}/store/${stickerPackBannerAssetId}.${format}`;
    },
    /**
     * Route for:
     * - GET `team-icons/{team.id}/{team.icon}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    teamIcon(teamId, teamIcon, format) {
        return `/team-icons/${teamId}/${teamIcon}.${format}`;
    },
    /**
     * Route for:
     * - GET `/stickers/{sticker.id}.{png|json}`
     *
     * This route supports the extensions: PNG, Lottie
     */
    sticker(stickerId, format) {
        return `/stickers/${stickerId}.${format}`;
    },
    /**
     * Route for:
     * - GET `/role-icons/{role.id}/{role.icon}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    roleIcon(roleId, roleIcon, format) {
        return `/role-icons/${roleId}/${roleIcon}.${format}`;
    },
    /**
     * Route for:
     * - GET `/guild-events/{guild_scheduled_event.id}/{guild_scheduled_event.image}.{png|jpeg|webp}`
     *
     * This route supports the extensions: PNG, JPEG, WebP
     */
    guildScheduledEventCover(guildScheduledEventId, guildScheduledEventCoverImage, format) {
        return `/guild-events/${guildScheduledEventId}/${guildScheduledEventCoverImage}.${format}`;
    },
    /**
     * Route for:
     * - GET `/guilds/${guild.id}/users/${user.id}/banners/${guild_member.banner}.{png|jpeg|webp|gif}`
     *
     * This route supports the extensions: PNG, JPEG, WebP, GIF
     */
    guildMemberBanner(guildId, userId, guildMemberBanner, format) {
        return `/guilds/${guildId}/users/${userId}/banners/${guildMemberBanner}.${format}`;
    },
};
var ImageFormat;
(function (ImageFormat) {
    ImageFormat["JPEG"] = "jpeg";
    ImageFormat["PNG"] = "png";
    ImageFormat["WebP"] = "webp";
    ImageFormat["GIF"] = "gif";
    ImageFormat["Lottie"] = "json";
})(ImageFormat = exports.ImageFormat || (exports.ImageFormat = {}));
exports.RouteBases = {
    api: `https://discord.com/api/v${exports.APIVersion}`,
    cdn: 'https://cdn.discordapp.com',
    invite: 'https://discord.gg',
    template: 'https://discord.new',
    gift: 'https://discord.gift',
    scheduledEvent: 'https://discord.com/events',
};
// Freeze bases object
Object.freeze(exports.RouteBases);
exports.OAuth2Routes = {
    authorizationURL: `${exports.RouteBases.api}${exports.Routes.oauth2Authorization()}`,
    tokenURL: `${exports.RouteBases.api}${exports.Routes.oauth2TokenExchange()}`,
    /**
     * See https://tools.ietf.org/html/rfc7009
     */
    tokenRevocationURL: `${exports.RouteBases.api}${exports.Routes.oauth2TokenRevocation()}`,
};
// Freeze OAuth2 route object
Object.freeze(exports.OAuth2Routes);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 7088:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=interactions.js.map

/***/ }),

/***/ 8362:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=invite.js.map

/***/ }),

/***/ 1987:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=oauth2.js.map

/***/ }),

/***/ 380:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=stageInstance.js.map

/***/ }),

/***/ 4129:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=sticker.js.map

/***/ }),

/***/ 303:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=template.js.map

/***/ }),

/***/ 6562:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=user.js.map

/***/ }),

/***/ 6653:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=voice.js.map

/***/ }),

/***/ 8103:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=webhook.js.map

/***/ }),

/***/ 6360:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RPCCloseEventCodes = exports.RPCErrorCodes = void 0;
/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes
 */
var RPCErrorCodes;
(function (RPCErrorCodes) {
    RPCErrorCodes[RPCErrorCodes["UnknownError"] = 1000] = "UnknownError";
    RPCErrorCodes[RPCErrorCodes["InvalidPayload"] = 4000] = "InvalidPayload";
    RPCErrorCodes[RPCErrorCodes["InvalidCommand"] = 4002] = "InvalidCommand";
    RPCErrorCodes[RPCErrorCodes["InvalidGuild"] = 4003] = "InvalidGuild";
    RPCErrorCodes[RPCErrorCodes["InvalidEvent"] = 4004] = "InvalidEvent";
    RPCErrorCodes[RPCErrorCodes["InvalidChannel"] = 4005] = "InvalidChannel";
    RPCErrorCodes[RPCErrorCodes["InvalidPermissions"] = 4006] = "InvalidPermissions";
    RPCErrorCodes[RPCErrorCodes["InvalidClientId"] = 4007] = "InvalidClientId";
    RPCErrorCodes[RPCErrorCodes["InvalidOrigin"] = 4008] = "InvalidOrigin";
    RPCErrorCodes[RPCErrorCodes["InvalidToken"] = 4009] = "InvalidToken";
    RPCErrorCodes[RPCErrorCodes["InvalidUser"] = 4010] = "InvalidUser";
    RPCErrorCodes[RPCErrorCodes["OAuth2Error"] = 5000] = "OAuth2Error";
    RPCErrorCodes[RPCErrorCodes["SelectChannelTimedOut"] = 5001] = "SelectChannelTimedOut";
    RPCErrorCodes[RPCErrorCodes["GetGuildTimedOut"] = 5002] = "GetGuildTimedOut";
    RPCErrorCodes[RPCErrorCodes["SelectVoiceForceRequired"] = 5003] = "SelectVoiceForceRequired";
    RPCErrorCodes[RPCErrorCodes["CaptureShortcutAlreadyListening"] = 5004] = "CaptureShortcutAlreadyListening";
})(RPCErrorCodes = exports.RPCErrorCodes || (exports.RPCErrorCodes = {}));
/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes
 */
var RPCCloseEventCodes;
(function (RPCCloseEventCodes) {
    RPCCloseEventCodes[RPCCloseEventCodes["InvalidClientId"] = 4000] = "InvalidClientId";
    RPCCloseEventCodes[RPCCloseEventCodes["InvalidOrigin"] = 4001] = "InvalidOrigin";
    RPCCloseEventCodes[RPCCloseEventCodes["RateLimited"] = 4002] = "RateLimited";
    RPCCloseEventCodes[RPCCloseEventCodes["TokenRevoked"] = 4003] = "TokenRevoked";
    RPCCloseEventCodes[RPCCloseEventCodes["InvalidVersion"] = 4004] = "InvalidVersion";
    RPCCloseEventCodes[RPCCloseEventCodes["InvalidEncoding"] = 4005] = "InvalidEncoding";
})(RPCCloseEventCodes = exports.RPCCloseEventCodes || (exports.RPCCloseEventCodes = {}));
//# sourceMappingURL=common.js.map

/***/ }),

/***/ 9417:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(6360), exports);
//# sourceMappingURL=v10.js.map

/***/ }),

/***/ 6570:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isContextMenuApplicationCommandInteraction = exports.isChatInputApplicationCommandInteraction = exports.isMessageComponentSelectMenuInteraction = exports.isMessageComponentButtonInteraction = exports.isMessageComponentInteraction = exports.isInteractionButton = exports.isLinkButton = exports.isMessageComponentGuildInteraction = exports.isMessageComponentDMInteraction = exports.isApplicationCommandGuildInteraction = exports.isApplicationCommandDMInteraction = exports.isGuildInteraction = exports.isDMInteraction = void 0;
const index_1 = __nccwpck_require__(7771);
// Interactions
/**
 * A type-guard check for DM interactions
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the interaction was received in a DM channel
 */
function isDMInteraction(interaction) {
    return Reflect.has(interaction, 'user');
}
exports.isDMInteraction = isDMInteraction;
/**
 * A type-guard check for guild interactions
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the interaction was received in a guild
 */
function isGuildInteraction(interaction) {
    return Reflect.has(interaction, 'guild_id');
}
exports.isGuildInteraction = isGuildInteraction;
// ApplicationCommandInteractions
/**
 * A type-guard check for DM application command interactions
 * @param interaction The application command interaction to check against
 * @returns A boolean that indicates if the application command interaction was received in a DM channel
 */
function isApplicationCommandDMInteraction(interaction) {
    return isDMInteraction(interaction);
}
exports.isApplicationCommandDMInteraction = isApplicationCommandDMInteraction;
/**
 * A type-guard check for guild application command interactions
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the application command interaction was received in a guild
 */
function isApplicationCommandGuildInteraction(interaction) {
    return isGuildInteraction(interaction);
}
exports.isApplicationCommandGuildInteraction = isApplicationCommandGuildInteraction;
// MessageComponentInteractions
/**
 * A type-guard check for DM message component interactions
 * @param interaction The message component interaction to check against
 * @returns A boolean that indicates if the message component interaction was received in a DM channel
 */
function isMessageComponentDMInteraction(interaction) {
    return isDMInteraction(interaction);
}
exports.isMessageComponentDMInteraction = isMessageComponentDMInteraction;
/**
 * A type-guard check for guild message component interactions
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the message component interaction was received in a guild
 */
function isMessageComponentGuildInteraction(interaction) {
    return isGuildInteraction(interaction);
}
exports.isMessageComponentGuildInteraction = isMessageComponentGuildInteraction;
// Buttons
/**
 * A type-guard check for buttons that have a `url` attached to them.
 * @param component The button to check against
 * @returns A boolean that indicates if the button has a `url` attached to it
 */
function isLinkButton(component) {
    return component.style === index_1.ButtonStyle.Link;
}
exports.isLinkButton = isLinkButton;
/**
 * A type-guard check for buttons that have a `custom_id` attached to them.
 * @param button The button to check against
 * @returns A boolean that indicates if the button has a `custom_id` attached to it
 */
function isInteractionButton(component) {
    return component.style !== index_1.ButtonStyle.Link;
}
exports.isInteractionButton = isInteractionButton;
// Message Components
/**
 * A type-guard check for message component interactions
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the interaction is a message component
 */
function isMessageComponentInteraction(interaction) {
    return interaction.type === index_1.InteractionType.MessageComponent;
}
exports.isMessageComponentInteraction = isMessageComponentInteraction;
/**
 * A type-guard check for button message component interactions
 * @param interaction The message component interaction to check against
 * @returns A boolean that indicates if the message component is a button
 */
function isMessageComponentButtonInteraction(interaction) {
    return interaction.data.component_type === index_1.ComponentType.Button;
}
exports.isMessageComponentButtonInteraction = isMessageComponentButtonInteraction;
/**
 * A type-guard check for select menu message component interactions
 * @param interaction The message component interaction to check against
 * @returns A boolean that indicates if the message component is a select menu
 */
function isMessageComponentSelectMenuInteraction(interaction) {
    return interaction.data.component_type === index_1.ComponentType.SelectMenu;
}
exports.isMessageComponentSelectMenuInteraction = isMessageComponentSelectMenuInteraction;
// Application Commands
/**
 * A type-guard check for chat input application commands.
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the interaction is a chat input application command
 */
function isChatInputApplicationCommandInteraction(interaction) {
    return interaction.data.type === index_1.ApplicationCommandType.ChatInput;
}
exports.isChatInputApplicationCommandInteraction = isChatInputApplicationCommandInteraction;
/**
 * A type-guard check for context menu application commands.
 * @param interaction The interaction to check against
 * @returns A boolean that indicates if the interaction is a context menu application command
 */
function isContextMenuApplicationCommandInteraction(interaction) {
    return (interaction.data.type === index_1.ApplicationCommandType.Message || interaction.data.type === index_1.ApplicationCommandType.User);
}
exports.isContextMenuApplicationCommandInteraction = isContextMenuApplicationCommandInteraction;
//# sourceMappingURL=v10.js.map

/***/ }),

/***/ 3753:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utils = void 0;
__exportStar(__nccwpck_require__(1817), exports);
__exportStar(__nccwpck_require__(8774), exports);
__exportStar(__nccwpck_require__(7771), exports);
__exportStar(__nccwpck_require__(6206), exports);
__exportStar(__nccwpck_require__(9417), exports);
exports.Utils = __nccwpck_require__(6570);
//# sourceMappingURL=v10.js.map

/***/ }),

/***/ 6246:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(8663);


/***/ }),

/***/ 8663:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


var net = __nccwpck_require__(1808);
var tls = __nccwpck_require__(4404);
var http = __nccwpck_require__(3685);
var https = __nccwpck_require__(5687);
var events = __nccwpck_require__(2361);
var assert = __nccwpck_require__(9491);
var util = __nccwpck_require__(3837);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 5305:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "v1", ({
  enumerable: true,
  get: function () {
    return _v.default;
  }
}));
Object.defineProperty(exports, "v3", ({
  enumerable: true,
  get: function () {
    return _v2.default;
  }
}));
Object.defineProperty(exports, "v4", ({
  enumerable: true,
  get: function () {
    return _v3.default;
  }
}));
Object.defineProperty(exports, "v5", ({
  enumerable: true,
  get: function () {
    return _v4.default;
  }
}));
Object.defineProperty(exports, "NIL", ({
  enumerable: true,
  get: function () {
    return _nil.default;
  }
}));
Object.defineProperty(exports, "version", ({
  enumerable: true,
  get: function () {
    return _version.default;
  }
}));
Object.defineProperty(exports, "validate", ({
  enumerable: true,
  get: function () {
    return _validate.default;
  }
}));
Object.defineProperty(exports, "stringify", ({
  enumerable: true,
  get: function () {
    return _stringify.default;
  }
}));
Object.defineProperty(exports, "parse", ({
  enumerable: true,
  get: function () {
    return _parse.default;
  }
}));

var _v = _interopRequireDefault(__nccwpck_require__(2813));

var _v2 = _interopRequireDefault(__nccwpck_require__(9303));

var _v3 = _interopRequireDefault(__nccwpck_require__(9137));

var _v4 = _interopRequireDefault(__nccwpck_require__(8993));

var _nil = _interopRequireDefault(__nccwpck_require__(3886));

var _version = _interopRequireDefault(__nccwpck_require__(7954));

var _validate = _interopRequireDefault(__nccwpck_require__(558));

var _stringify = _interopRequireDefault(__nccwpck_require__(6506));

var _parse = _interopRequireDefault(__nccwpck_require__(4286));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 7303:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('md5').update(bytes).digest();
}

var _default = md5;
exports["default"] = _default;

/***/ }),

/***/ 3886:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = '00000000-0000-0000-0000-000000000000';
exports["default"] = _default;

/***/ }),

/***/ 4286:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(558));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  let v;
  const arr = new Uint8Array(16); // Parse ########-....-....-....-............

  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 0xff;
  arr[2] = v >>> 8 & 0xff;
  arr[3] = v & 0xff; // Parse ........-####-....-....-............

  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 0xff; // Parse ........-....-####-....-............

  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 0xff; // Parse ........-....-....-####-............

  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 0xff; // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
  arr[11] = v / 0x100000000 & 0xff;
  arr[12] = v >>> 24 & 0xff;
  arr[13] = v >>> 16 & 0xff;
  arr[14] = v >>> 8 & 0xff;
  arr[15] = v & 0xff;
  return arr;
}

var _default = parse;
exports["default"] = _default;

/***/ }),

/***/ 5719:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
exports["default"] = _default;

/***/ }),

/***/ 2502:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = rng;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;

function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    _crypto.default.randomFillSync(rnds8Pool);

    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),

/***/ 391:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _crypto = _interopRequireDefault(__nccwpck_require__(6113));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return _crypto.default.createHash('sha1').update(bytes).digest();
}

var _default = sha1;
exports["default"] = _default;

/***/ }),

/***/ 6506:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(558));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

var _default = stringify;
exports["default"] = _default;

/***/ }),

/***/ 2813:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(2502));

var _stringify = _interopRequireDefault(__nccwpck_require__(6506));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng.default)();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0, _stringify.default)(b);
}

var _default = v1;
exports["default"] = _default;

/***/ }),

/***/ 9303:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(8759));

var _md = _interopRequireDefault(__nccwpck_require__(7303));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v3 = (0, _v.default)('v3', 0x30, _md.default);
var _default = v3;
exports["default"] = _default;

/***/ }),

/***/ 8759:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = _default;
exports.URL = exports.DNS = void 0;

var _stringify = _interopRequireDefault(__nccwpck_require__(6506));

var _parse = _interopRequireDefault(__nccwpck_require__(4286));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape

  const bytes = [];

  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.DNS = DNS;
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
exports.URL = URL;

function _default(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === 'string') {
      value = stringToBytes(value);
    }

    if (typeof namespace === 'string') {
      namespace = (0, _parse.default)(namespace);
    }

    if (namespace.length !== 16) {
      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    } // Compute hash of namespace and value, Per 4.3
    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
    // hashfunc([...namespace, ... value])`


    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 0x0f | version;
    bytes[8] = bytes[8] & 0x3f | 0x80;

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }

      return buf;
    }

    return (0, _stringify.default)(bytes);
  } // Function#name is not settable on some platforms (#270)


  try {
    generateUUID.name = name; // eslint-disable-next-line no-empty
  } catch (err) {} // For CommonJS default export support


  generateUUID.DNS = DNS;
  generateUUID.URL = URL;
  return generateUUID;
}

/***/ }),

/***/ 9137:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _rng = _interopRequireDefault(__nccwpck_require__(2502));

var _stringify = _interopRequireDefault(__nccwpck_require__(6506));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function v4(options, buf, offset) {
  options = options || {};

  const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0, _stringify.default)(rnds);
}

var _default = v4;
exports["default"] = _default;

/***/ }),

/***/ 8993:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _v = _interopRequireDefault(__nccwpck_require__(8759));

var _sha = _interopRequireDefault(__nccwpck_require__(391));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const v5 = (0, _v.default)('v5', 0x50, _sha.default);
var _default = v5;
exports["default"] = _default;

/***/ }),

/***/ 558:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _regex = _interopRequireDefault(__nccwpck_require__(5719));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validate(uuid) {
  return typeof uuid === 'string' && _regex.default.test(uuid);
}

var _default = validate;
exports["default"] = _default;

/***/ }),

/***/ 7954:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;

var _validate = _interopRequireDefault(__nccwpck_require__(558));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function version(uuid) {
  if (!(0, _validate.default)(uuid)) {
    throw TypeError('Invalid UUID');
  }

  return parseInt(uuid.substr(14, 1), 16);
}

var _default = version;
exports["default"] = _default;

/***/ }),

/***/ 9491:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 6113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 3685:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 5687:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1808:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2037:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 1017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 4404:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 3837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 2323:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

class Collection extends Map {
  ensure(key, defaultValueGenerator) {
    if (this.has(key))
      return this.get(key);
    if (typeof defaultValueGenerator !== "function")
      throw new TypeError(`${defaultValueGenerator} is not a function`);
    const defaultValue = defaultValueGenerator(key, this);
    this.set(key, defaultValue);
    return defaultValue;
  }
  hasAll(...keys) {
    return keys.every((k) => super.has(k));
  }
  hasAny(...keys) {
    return keys.some((k) => super.has(k));
  }
  first(amount) {
    if (typeof amount === "undefined")
      return this.values().next().value;
    if (amount < 0)
      return this.last(amount * -1);
    amount = Math.min(this.size, amount);
    const iter = this.values();
    return Array.from({ length: amount }, () => iter.next().value);
  }
  firstKey(amount) {
    if (typeof amount === "undefined")
      return this.keys().next().value;
    if (amount < 0)
      return this.lastKey(amount * -1);
    amount = Math.min(this.size, amount);
    const iter = this.keys();
    return Array.from({ length: amount }, () => iter.next().value);
  }
  last(amount) {
    const arr = [...this.values()];
    if (typeof amount === "undefined")
      return arr[arr.length - 1];
    if (amount < 0)
      return this.first(amount * -1);
    if (!amount)
      return [];
    return arr.slice(-amount);
  }
  lastKey(amount) {
    const arr = [...this.keys()];
    if (typeof amount === "undefined")
      return arr[arr.length - 1];
    if (amount < 0)
      return this.firstKey(amount * -1);
    if (!amount)
      return [];
    return arr.slice(-amount);
  }
  at(index) {
    index = Math.floor(index);
    const arr = [...this.values()];
    return arr.at(index);
  }
  keyAt(index) {
    index = Math.floor(index);
    const arr = [...this.keys()];
    return arr.at(index);
  }
  random(amount) {
    const arr = [...this.values()];
    if (typeof amount === "undefined")
      return arr[Math.floor(Math.random() * arr.length)];
    if (!arr.length || !amount)
      return [];
    return Array.from(
      { length: Math.min(amount, arr.length) },
      () => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
    );
  }
  randomKey(amount) {
    const arr = [...this.keys()];
    if (typeof amount === "undefined")
      return arr[Math.floor(Math.random() * arr.length)];
    if (!arr.length || !amount)
      return [];
    return Array.from(
      { length: Math.min(amount, arr.length) },
      () => arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
    );
  }
  reverse() {
    const entries = [...this.entries()].reverse();
    this.clear();
    for (const [key, value] of entries)
      this.set(key, value);
    return this;
  }
  find(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (fn(val, key, this))
        return val;
    }
    return void 0;
  }
  findKey(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (fn(val, key, this))
        return key;
    }
    return void 0;
  }
  sweep(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    const previousSize = this.size;
    for (const [key, val] of this) {
      if (fn(val, key, this))
        this.delete(key);
    }
    return previousSize - this.size;
  }
  filter(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    const results = new this.constructor[Symbol.species]();
    for (const [key, val] of this) {
      if (fn(val, key, this))
        results.set(key, val);
    }
    return results;
  }
  partition(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    const results = [
      new this.constructor[Symbol.species](),
      new this.constructor[Symbol.species]()
    ];
    for (const [key, val] of this) {
      if (fn(val, key, this)) {
        results[0].set(key, val);
      } else {
        results[1].set(key, val);
      }
    }
    return results;
  }
  flatMap(fn, thisArg) {
    const collections = this.map(fn, thisArg);
    return new this.constructor[Symbol.species]().concat(...collections);
  }
  map(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    const iter = this.entries();
    return Array.from({ length: this.size }, () => {
      const [key, value] = iter.next().value;
      return fn(value, key, this);
    });
  }
  mapValues(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    const coll = new this.constructor[Symbol.species]();
    for (const [key, val] of this)
      coll.set(key, fn(val, key, this));
    return coll;
  }
  some(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (fn(val, key, this))
        return true;
    }
    return false;
  }
  every(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (!fn(val, key, this))
        return false;
    }
    return true;
  }
  reduce(fn, initialValue) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    let accumulator;
    if (typeof initialValue !== "undefined") {
      accumulator = initialValue;
      for (const [key, val] of this)
        accumulator = fn(accumulator, val, key, this);
      return accumulator;
    }
    let first = true;
    for (const [key, val] of this) {
      if (first) {
        accumulator = val;
        first = false;
        continue;
      }
      accumulator = fn(accumulator, val, key, this);
    }
    if (first) {
      throw new TypeError("Reduce of empty collection with no initial value");
    }
    return accumulator;
  }
  each(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    this.forEach(fn, thisArg);
    return this;
  }
  tap(fn, thisArg) {
    if (typeof fn !== "function")
      throw new TypeError(`${fn} is not a function`);
    if (typeof thisArg !== "undefined")
      fn = fn.bind(thisArg);
    fn(this);
    return this;
  }
  clone() {
    return new this.constructor[Symbol.species](this);
  }
  concat(...collections) {
    const newColl = this.clone();
    for (const coll of collections) {
      for (const [key, val] of coll)
        newColl.set(key, val);
    }
    return newColl;
  }
  equals(collection) {
    if (!collection)
      return false;
    if (this === collection)
      return true;
    if (this.size !== collection.size)
      return false;
    for (const [key, value] of this) {
      if (!collection.has(key) || value !== collection.get(key)) {
        return false;
      }
    }
    return true;
  }
  sort(compareFunction = Collection.defaultSort) {
    const entries = [...this.entries()];
    entries.sort((a, b) => compareFunction(a[1], b[1], a[0], b[0]));
    super.clear();
    for (const [k, v] of entries) {
      super.set(k, v);
    }
    return this;
  }
  intersect(other) {
    const coll = new this.constructor[Symbol.species]();
    for (const [k, v] of other) {
      if (this.has(k) && Object.is(v, this.get(k))) {
        coll.set(k, v);
      }
    }
    return coll;
  }
  difference(other) {
    const coll = new this.constructor[Symbol.species]();
    for (const [k, v] of other) {
      if (!this.has(k))
        coll.set(k, v);
    }
    for (const [k, v] of this) {
      if (!other.has(k))
        coll.set(k, v);
    }
    return coll;
  }
  merge(other, whenInSelf, whenInOther, whenInBoth) {
    const coll = new this.constructor[Symbol.species]();
    const keys = /* @__PURE__ */ new Set([...this.keys(), ...other.keys()]);
    for (const k of keys) {
      const hasInSelf = this.has(k);
      const hasInOther = other.has(k);
      if (hasInSelf && hasInOther) {
        const r = whenInBoth(this.get(k), other.get(k), k);
        if (r.keep)
          coll.set(k, r.value);
      } else if (hasInSelf) {
        const r = whenInSelf(this.get(k), k);
        if (r.keep)
          coll.set(k, r.value);
      } else if (hasInOther) {
        const r = whenInOther(other.get(k), k);
        if (r.keep)
          coll.set(k, r.value);
      }
    }
    return coll;
  }
  sorted(compareFunction = Collection.defaultSort) {
    return new this.constructor[Symbol.species](this).sort((av, bv, ak, bk) => compareFunction(av, bv, ak, bk));
  }
  toJSON() {
    return [...this.values()];
  }
  static defaultSort(firstValue, secondValue) {
    return Number(firstValue > secondValue) || Number(firstValue === secondValue) - 1;
  }
  static combineEntries(entries, combine) {
    const coll = new Collection();
    for (const [k, v] of entries) {
      if (coll.has(k)) {
        coll.set(k, combine(coll.get(k), v, k));
      } else {
        coll.set(k, v);
      }
    }
    return coll;
  }
}

exports.Collection = Collection;
//# sourceMappingURL=collection.cjs.map


/***/ }),

/***/ 3629:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const collection = __nccwpck_require__(2323);



exports.Collection = collection.Collection;
//# sourceMappingURL=index.cjs.map


/***/ }),

/***/ 313:
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
function ms(value, options) {
    try {
        if (typeof value === 'string' && value.length > 0) {
            return parse(value);
        }
        else if (typeof value === 'number' && isFinite(value)) {
            return options?.long ? fmtLong(value) : fmtShort(value);
        }
        throw new Error('Value is not a string or number.');
    }
    catch (error) {
        const message = isError(error)
            ? `${error.message}. value=${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
}
/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str) {
    str = String(str);
    if (str.length > 100) {
        throw new Error('Value exceeds the maximum length of 100 characters.');
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return NaN;
    }
    const n = parseFloat(match[1]);
    const type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            // This should never occur.
            throw new Error(`The unit ${type} was matched, but no matching case exists.`);
    }
}
exports["default"] = ms;
/**
 * Short format for `ms`.
 */
function fmtShort(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Long format for `ms`.
 */
function fmtLong(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return `${ms} ms`;
}
/**
 * Pluralization helper.
 */
function plural(ms, msAbs, n, name) {
    const isPlural = msAbs >= n * 1.5;
    return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
module.exports = exports.default;
module.exports["default"] = exports.default;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(1780);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;