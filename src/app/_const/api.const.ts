export const API_DOMAIN = 'https://fema-dev02.fifgroup.co.id';
// export const API_DOMAIN = 'https://fema.fifgroup.co.id';

const API_SERVICE_CORE = `${API_DOMAIN}/fema-core-service`;
const API_SERVICE_CREDENTIAL = `${API_DOMAIN}/fema-credential-service`;
const API_SERVICE_CULTURE = `${API_DOMAIN}/fema-culture-service`;
const API_SERVICE_THINKWARE = `${API_DOMAIN}/fema-thinkware-service`;
const API_SERVICE_FEEDBACK = `${API_DOMAIN}/fema-feedback-service`;
const API_SERVICE_FRONTEND = `${API_DOMAIN}/frontend`;
const API_SERVICE_HCMS = `${API_DOMAIN}/hcms`;
const API_SERVICE_HCMS_GATEWAY = `${API_DOMAIN}/fema-hcms-gateway-service`;
const API_SERVICE_LOOKUP = `${API_DOMAIN}/fema-lookup-service/lookup`;
const API_SERVICE_REPORT = `${API_DOMAIN}/fema-report-service`;
const API_SERVICE_TGP = `${API_DOMAIN}/fema-tgp-service`;
const API_SERVICE_VIDEO = `${API_DOMAIN}/fema-video-service`;
const API_SERVICE_NOTIFICATION = `${API_DOMAIN}/fema-notification-service`;
const API_RESOURCES = `${API_DOMAIN}/fema_resources/m1likk17ab3r5ama`;

export const API_AUTH_POST_INVALIDATE_TOKEN = `${API_DOMAIN}/auth/invalidate_token`;
export const API_AUTH_POST_LOGIN = `${API_DOMAIN}/login`;
export const API_AUTH_POST_REFRESH_TOKEN = `${API_DOMAIN}/auth/refresh_token`;

export const API_CHANNEL_GET = `${API_SERVICE_VIDEO}/api/channel/get`;
export const API_CHANNEL_GET_RECEIVER_ERROR = `${API_SERVICE_VIDEO}/api/channel/download/xls`;
export const API_CHANNEL_GET_SUGGESTION = `${API_SERVICE_VIDEO}/api/channel/list`;
export const API_CHANNEL_POST_SAVE = `${API_SERVICE_VIDEO}/api/channel/`;
export const API_CHANNEL_POST_SEARCH = `${API_SERVICE_VIDEO}/api/channel/inquiry`;
export const API_CHANNEL_POST_UNIQUE_TITLE = `${API_SERVICE_VIDEO}/api/channel/validate/channel`;
export const API_CHANNEL_POST_VIEWER = `${API_SERVICE_VIDEO}/api/channel/upload/viewer`;
export const API_CHANNEL_DELETE = `${API_SERVICE_VIDEO}/api/channel`;
export const API_CHANNEL_GET_RECEIVER = `${API_SERVICE_VIDEO}/api/channel/membership`;

export const API_COMMENT_POST_NEWS_DETAIL = `${API_SERVICE_CORE}/api/comment/get/bynews`;
export const API_COMMENT_POST_NEWS_SEARCH = `${API_SERVICE_CORE}/api/comment/inquiry`;
export const API_COMMENT_POST_VIDEO_DETAIL = `${API_SERVICE_VIDEO}/api/comment/get/byfiftube`;
export const API_COMMENT_POST_VIDEO_SEARCH = `${API_SERVICE_VIDEO}/api/comment/inquiry`;
export const API_COMMENT_DELETE_NEWS = `${API_SERVICE_CORE}/api/comment/delete`;
export const API_COMMENT_DELETE_VIDEO = `${API_SERVICE_VIDEO}/api/comment/delete`;

export const API_CONTENT_DELETE = `${API_SERVICE_CORE}/api/content`;
export const API_CONTENT_GET = `${API_SERVICE_CORE}/api/content/get`;
export const API_CONTENT_GET_GENERATE_PATH = `${API_SERVICE_FRONTEND}/content/generate_path`;
export const API_CONTENT_GET_SEARCH_SUGGESTION = `${API_SERVICE_CORE}/api/content/list/all`;
export const API_CONTENT_GET_SUGGESTION = `${API_SERVICE_CORE}/api/content/list`;
export const API_CONTENT_GET_VALIDATE_DEFAULT_BANNER = `${API_SERVICE_CORE}/api/content/validate/default/banner`;
export const API_CONTENT_GET_RECEIVER = `${API_SERVICE_CORE}/api/content/get/receivers`;
export const API_CONTENT_GET_RECEIVER_ERROR = `${API_SERVICE_CORE}/api/content/download/xls`;
export const API_CONTENT_POST_SAVE = `${API_SERVICE_CORE}/api/content/`;
export const API_CONTENT_POST_SEARCH = `${API_SERVICE_CORE}/api/content/inquiry`;
export const API_CONTENT_POST_RECEIVER = `${API_SERVICE_CORE}/api/content/upload/receiver`;
export const API_CONTENT_POST_UNIQUE_TITLE = `${API_SERVICE_CORE}/api/content/validate/title`;
export const API_CONTENT_POST_UPLOAD = `${API_SERVICE_FRONTEND}/content/upload`;
export const API_CONTENT_SUGGESTION_VIEWER = `${API_SERVICE_CORE}/api/content/history/viewer_suggestion`;

export const API_CREDENTIAL_GET_MENU = `${API_SERVICE_CREDENTIAL}/credential-controller/mymenu`;

export const API_EVENT_GET = `${API_SERVICE_CORE}/api/event/get`;
export const API_EVENT_GET_EVENT_SHARING = `${API_SERVICE_CORE}/api/event/details/event-sharing`;
export const API_EVENT_GET_PARTICIPANTS = `${API_SERVICE_CORE}/api/event/get/membership`;
export const API_EVENT_GET_RECEIVER_ERROR = `${API_SERVICE_CORE}/api/event/download/xls`;
export const API_EVENT_GET_SEND_REMINDER = `${API_SERVICE_CORE}/api/event/send/reminder`;
export const API_EVENT_GET_SUGGESTION = `${API_SERVICE_CORE}/api/event/list`;
export const API_EVENT_POST_RECEIVER = `${API_SERVICE_CORE}/api/event/upload/receiver`;
export const API_EVENT_POST_SAVE = `${API_SERVICE_CORE}/api/event/`;
export const API_EVENT_POST_SEARCH = `${API_SERVICE_CORE}/api/event/search`;
export const API_EVENT_POST_UNIQUE_TITLE = `${API_SERVICE_CORE}/api/event/validate/name`;
export const API_EVENT_POST_EVENT_SHARING_REPORT = `${API_SERVICE_REPORT}/api/report/generator/eventSharing`;
export const API_EVENT_POST_EVENT_ATTEND = `${API_SERVICE_REPORT}/api/report/generator/eventTotalAttend`;
export const API_EVENT_POST_EVENT_ATTEND_SURVEY = `${API_SERVICE_REPORT}/api/report/generator/eventTotalAttendSurvey`;

export const API_FEEDBACK_DELETE = `${API_SERVICE_FEEDBACK}/feedback/delete`;
export const API_FEEDBACK_DELETE_MAPPING = `${API_SERVICE_FEEDBACK}/feedback_mapping/delete/`;
export const API_FEEDBACK_GET = `${API_SERVICE_FEEDBACK}/feedback/view`;
export const API_FEEDBACK_GET_MAPPING_NAME = `${API_SERVICE_FEEDBACK}/feedback_mapping/get_feedback_name/`;
export const API_FEEDBACK_GET_NAME = `${API_SERVICE_FEEDBACK}/feedback_mapping/get_feedback_name/`;
export const API_FEEDBACK_GET_ITEM_SUGGESTION = `${API_SERVICE_FEEDBACK}/feedback_mapping/item_suggestion`;
export const API_FEEDBACK_GET_REPORT_QUESTION_LIST = `${API_SERVICE_FEEDBACK}/feedback_report/search`;
export const API_FEEDBACK_GET_SEQUENCE = `${API_SERVICE_FEEDBACK}/feedback/sequence/change_sequence`;
export const API_FEEDBACK_GET_TEMPLATE_SUGGESTION = `${API_SERVICE_FEEDBACK}/feedback/template_suggestion`;
export const API_FEEDBACK_POST_MAPPING_SAVE = `${API_SERVICE_FEEDBACK}/feedback_mapping/save`;
export const API_FEEDBACK_POST_SAVE = `${API_SERVICE_FEEDBACK}/feedback/save`;
export const API_FEEDBACK_POST_SAVE_SEQUENCE = `${API_SERVICE_FEEDBACK}/feedback/sequence/change_sequence/save`;
export const API_FEEDBACK_POST_SEARCH = `${API_SERVICE_FEEDBACK}/feedback/search`;
export const API_FEEDBACK_POST_TOTAL_RESPONDENTS = `${API_SERVICE_FEEDBACK}/feedback/itemsWithItsCountFeedback`;
export const API_FEEDBACK_POST_UNIQUE_TITLE = `${API_SERVICE_FEEDBACK}/feedback/validate_template`;

export const API_HCMS_GET_ALL_BRANCH = `${API_SERVICE_HCMS_GATEWAY}/gateway/branch/all`;
export const API_HCMS_GET_ALL_ORGANIZATIONS = `${API_SERVICE_HCMS_GATEWAY}/gateway/organization/all`;
export const API_HCMS_GET_BRANCH_NAME = `${API_SERVICE_HCMS_GATEWAY}/gateway/branch/get`;
export const API_HCMS_GET_EMPLOYEE_NPO_NPK = `${API_SERVICE_HCMS_GATEWAY}/gateway/employee/find/by_fullname_or_username`;
export const API_HCMS_GET_EMPLOYEE_NPK = `${API_SERVICE_HCMS_GATEWAY}/gateway/employee/find/all/npk`;
export const API_HCMS_GET_EMPLOYEE_SUGGESTIONS = `${API_SERVICE_HCMS_GATEWAY}/gateway/employee/find/all/npk/suggestion`;
export const API_HCMS_GET_JOB_SUGGESTIONS = `${API_SERVICE_HCMS_GATEWAY}/gateway/job/all`;
export const API_HCMS_GET_UPLOAD_TEMPLATE = `${API_SERVICE_HCMS_GATEWAY}/api/upload-template/generateTemplate`;
export const API_HCMS_GET_UPLOAD_TEMPLATE_TGP = `${API_SERVICE_HCMS_GATEWAY}/api/upload-template/generateTGPTemplate`;
export const API_HCMS_POST_PIC_VALIDATION = `${API_SERVICE_HCMS_GATEWAY}/gateway/employee/validation`;

export const API_LOOKUP_GET_DETAIL_LIST = `${API_SERVICE_LOOKUP}/detail_list`;
export const API_LOOKUP_GET_DETAIL_MEANING = `${API_SERVICE_LOOKUP}/detail_meaning`;
export const API_LOOKUP_GET = `${API_SERVICE_LOOKUP}`;
export const API_LOOKUP_POST_SAVE = `${API_SERVICE_LOOKUP}/save`;
export const API_LOOKUP_POST_SEARCH = `${API_SERVICE_LOOKUP}/search`;

export const API_NOTIFICATION_GET_DETAIL = `${API_SERVICE_NOTIFICATION}/history/detail`;
export const API_NOTIFICATION_POST_FIND_ALL = `${API_SERVICE_NOTIFICATION}/history/findAll`;

export const API_REPORT_GET_ACTIVITIES = `${API_SERVICE_CULTURE}/api/report_activities/find_report_activities`;
export const API_REPORT_GET_FILE = `${API_SERVICE_REPORT}/report-viewer`;
export const API_REPORT_GET_TGP_COUPON_XLSX = `${API_SERVICE_REPORT}/api/tgp/report/tgp_coupon_per_npk_xlsx`;
export const API_REPORT_POST_ACTIVITIES_SEARCH = `${API_SERVICE_CULTURE}/api/report_activities/acara/search`;
export const API_REPORT_POST_TGP_COUPON_JSON = `${API_SERVICE_REPORT}/api/tgp/report/tgp_coupon_per_npk/json`;
export const API_REPORT_POST_USER_SESSION = `${API_SERVICE_REPORT}/api/report/generator/userSession`;
export const API_REPORT_POST_YEARLY_USER_ACCESS = `${API_SERVICE_REPORT}/user-session-stats/yearly_user_access`;

export const API_DASHBOARD_BANNER_ACTIVE = `${API_SERVICE_CORE}/api/dashboard/activeBanner`;
export const API_DASHBOARD_EVENT_ACTIVE = `${API_SERVICE_CORE}/api/dashboard/activeEvent`;
export const API_DASHBOARD_EVENT_FEEDBACK = `${API_SERVICE_CORE}/api/dashboard/eventWithFeedback`;
export const API_DASHBOARD_EVENT_UPCOMING = `${API_SERVICE_CORE}/api/dashboard/upcomingEvent`;
export const API_DASHBOARD_NEWS_MOST_LIKED = `${API_SERVICE_CORE}/api/dashboard/mostLiked`;
export const API_DASHBOARD_NEWS_MOST_VIEWED = `${API_SERVICE_CORE}/api/dashboard/mostViewed`;

export const API_RESOURCE_REPORT_LOGO = `${API_RESOURCES}/otherimg_beff81026cef971af6bc5a0d50525f863c3db27ba5fea5328afbfd4e1f699403`;

export const API_RESPONSIBILITY_GET = `${API_SERVICE_CREDENTIAL}/responsibility/get`;
export const API_RESPONSIBILITY_GET_ALL_FUNCTIONS = `${API_SERVICE_CREDENTIAL}/responsibility/get_all_menu`;
export const API_RESPONSIBILITY_POST_SAVE = `${API_SERVICE_CREDENTIAL}/responsibility/save`;
export const API_RESPONSIBILITY_POST_SEARCH = `${API_SERVICE_CREDENTIAL}/responsibility/search`;
export const API_RESPONSIBILITY_POST_SEARCH_REPORT = `${API_SERVICE_REPORT}/api/report/generator/responsibility`;
export const API_RESPONSIBILITY_DELETE = `${API_SERVICE_CREDENTIAL}/responsibility/delete`;

export const API_TGP_GET_TGP = `${API_SERVICE_TGP}/api/upload/findTgp`;
export const API_TGP_GET_CANCEL = `${API_SERVICE_TGP}/api/upload/cancelUpload`;
export const API_TGP_GET_TEMPLATE = `${API_SERVICE_TGP}/api/upload/generateTemplate`;
export const API_TGP_POST_GENERATE_COUPON = `${API_SERVICE_TGP}/api/upload/generateCoupon`;
export const API_TGP_POST_FILE = `${API_SERVICE_TGP}/api/upload/processfile`;
export const API_TGP_POST_SEARCH = `${API_SERVICE_TGP}/api/upload/search`;

export const API_USER_GET = `${API_SERVICE_CREDENTIAL}/user_setup/get`;
export const API_USER_GET_NEXT_USERNAME = `${API_SERVICE_CREDENTIAL}/user_setup/next_username`;
export const API_USER_POST_SAVE = `${API_SERVICE_CREDENTIAL}/user_setup/save`;
export const API_USER_POST_SEARCH = `${API_SERVICE_CREDENTIAL}/user_setup/search`;
export const API_USER_TOTAL_ACCESS = `${API_SERVICE_REPORT}/user-session-stats/yearly_user_access/count`;

export const API_VIDEO_GET = `${API_SERVICE_VIDEO}/api/fiftube/get`;
export const API_VIDEO_GET_SUGGESTIONS = `${API_SERVICE_VIDEO}/api/fiftube/list`;
export const API_VIDEO_POST_SAVE = `${API_SERVICE_VIDEO}/api/fiftube/`;
export const API_VIDEO_POST_SEARCH = `${API_SERVICE_VIDEO}/api/fiftube/inquiry`;
export const API_VIDEO_DELETE = `${API_SERVICE_VIDEO}/api/fiftube`;
export const API_VIDEO_POST_UNIQUE_TITLE = `${API_SERVICE_VIDEO}/api/fiftube/validate/title`;

export const API_WISTIA_GET_API_PASSWORD = `${API_SERVICE_VIDEO}/api/config/admin_password`;

export const API_CULTURE_GET_BRANCH = `${API_SERVICE_CULTURE}/api/mapping_area/branchAll`;
export const API_CULTURE_GET_BRANCH_SEARCH = `${API_SERVICE_CULTURE}/api/mapping_area/available_branch`;
export const API_CULTURE_GET_BRANCH_SEARCH_EDIT = `${API_SERVICE_CULTURE}/api/mapping_area/available_branch_area_id`;
export const API_AREA_POST_SEARCH = `${API_SERVICE_CULTURE}/api/mapping_area/search`;
export const API_AREA_GET_ID = `${API_SERVICE_CULTURE}/api/mapping_area/find_area/`;
export const API_AREA_POST_SAVE = `${API_SERVICE_CULTURE}/api/mapping_area/save_area`;
export const API_AREA_DELETE = `${API_SERVICE_CULTURE}/api/mapping_area/delete/`;
export const API_AREA_SUGGESTION = `${API_SERVICE_CULTURE}/api/mapping_area/area_suggestion`;

export const API_HO_POST_SEARCH = `${API_SERVICE_CULTURE}/api/culture/mappingCellHo/search`;
export const API_HO_POST_SAVE = `${API_SERVICE_CULTURE}/api/cell_ho/save_cell_ho`;
export const API_HO_GET_ID = `${API_SERVICE_CULTURE}/api/cell_ho/get/`;
export const API_HO_DELETE = `${API_SERVICE_CULTURE}/api/cell_ho/delete/`;
export const API_GET_ORG_SUGGESTION = `${API_SERVICE_CULTURE}/api/cell_ho/org_suggestion`;
export const API_GET_HO_SUGGESTION = `${API_SERVICE_CULTURE}/api/cell_ho/ho_suggestion`;
export const API_HO_VALIDATE_CELL = `${API_SERVICE_CULTURE}/api/cell_ho/validate_cell_name`;
export const API_HO_VALIDATE_PEMBINA = `${API_SERVICE_CULTURE}/api/cell_ho/validate_pembina_utama`;
export const API_HO_VALIDATE_ORGANIZATION = `${API_SERVICE_CULTURE}/api/cell_ho/validate_organization`;

export const API_COUNTERPART_DELETE = `${API_SERVICE_CULTURE}/api/counterpart_setup/delete/`;
export const API_COUNTERPART_GET_ACTIVE_SUGGESTION = `${API_SERVICE_CULTURE}/api/counterpart_setup/active_counterpart_suggestion`;
export const API_COUNTERPART_GET_COUNTERPART = `${API_SERVICE_CULTURE}/api/counterpart_setup/get_cell_area`;
export const API_COUNTERPART_GET_NAME_SUGGESTION = `${API_SERVICE_CULTURE}/api/counterpart_setup/counterpart_name_suggestion`;
export const API_COUNTERPART_POST_SAVE = `${API_SERVICE_CULTURE}/api/counterpart_setup/save`;
export const API_COUNTERPART_POST_SEARCH = `${API_SERVICE_CULTURE}/api/counterpart_setup/search`;

export const API_THINKWARE_GET = `${API_SERVICE_THINKWARE}/thinkware/get`;
export const API_THINKWARE_DELETE = `${API_SERVICE_THINKWARE}/thinkware`;
export const API_THINKWARE_GET_DEPARTMENT = `${API_SERVICE_THINKWARE}/thinkware/suggest/departmentnew`;
export const API_THINKWARE_GET_LEAD_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/suggest/leaderName`;
export const API_THINKWARE_GET_MEMBER_LEAD_SUGGESTION_IS_ACTIVE = `${API_SERVICE_THINKWARE}/thinkware/suggest/membernameisActive`;
export const API_THINKWARE_GET_THINKWARE_SHARING = `${API_SERVICE_CORE}/api/thinkware/details/thinkware-sharing`;
export const API_THINKWARE_GET_PARTICIPANTS = `${API_SERVICE_CORE}/api/thinkware/get/membership`;
export const API_THINKWARE_GET_RECEIVER_ERROR = `${API_SERVICE_CORE}/api/thinkware/download/xls`;
export const API_THINKWARE_GET_GL_CODE = `${API_SERVICE_THINKWARE}/thinkware/suggest/glcode`;
export const API_THINKWARE_GET_TOOLTIP_II = `${API_SERVICE_THINKWARE}/thinkware/tooltip/ii/all`;
export const API_THINKWARE_GET_TOOLTIP_QCC = `${API_SERVICE_THINKWARE}/thinkware/tooltip/qcc/all`;
export const API_THINKWARE_GET_TOOLTIP_QCP = `${API_SERVICE_THINKWARE}/thinkware/tooltip/qcp/all`;
export const API_THINKWARE_GET_TOOLTIP_SS = `${API_SERVICE_THINKWARE}/thinkware/tooltip/ss/all`;
export const API_THINKWARE_GET_SEND_REMINDER = `${API_SERVICE_CORE}/api/thinkware/send/reminder`;
export const API_THINKWARE_GET_MEMBER_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/suggest/memberbranch`;
export const API_THINKWARE_GET_EMPLOYEE_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/suggest/leaderOrMemberName`;
export const API_THINKWARE_GET_MEMBER_LEAD_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/suggest/leaderOrMemberNameIsActive`;
export const API_THINKWARE_GET_DEPT_2 = `${API_SERVICE_THINKWARE}/thinkware/get/supervisor1and2`;
export const API_THINKWARE_GET_TITLE_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/list/suggesttitle`;
export const API_THINKWARE_GET_BRANCH_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/list/suggestbranch/`;
export const API_THINKWARE_GET_CODE_SUGGESTION = `${API_SERVICE_THINKWARE}/thinkware/list/suggestcode`;
export const API_THINKWARE_GET_SUPERVISOR = `${API_SERVICE_THINKWARE}/thinkware/suggest/supervisor`;
export const API_THINKWARE_POST_RECEIVER = `${API_SERVICE_CORE}/api/thinkware/upload/receiver`;
export const API_THINKWARE_POST_SAVE = `${API_SERVICE_THINKWARE}/thinkware/save`;
export const API_THINKWARE_LOOKFOR = `${API_SERVICE_THINKWARE}/thinkware/lookfor`;
export const API_THINKWARE_POST_SEARCH = `${API_SERVICE_THINKWARE}/thinkware/search`;
export const API_THINKWARE_POST_UNIQUE_TITLE = `${API_SERVICE_CORE}/api/thinkware/validate/name`;
export const API_THINKWARE_POST_THINKWARE_SHARING_REPORT = `${API_SERVICE_REPORT}/api/report/generator/thinkwareSharing`;
export const API_THINKWARE_POST_THINKWARE_ATTEND = `${API_SERVICE_REPORT}/api/report/generator/thinkwareTotalAttend`;
export const API_THINKWARE_POST_THINKWARE_ATTEND_SURVEY = `${API_SERVICE_REPORT}/api/report/generator/thinkwareTotalAttendSurvey`;
export const API_THINKWARE_POST_UPLOAD = `${API_SERVICE_FRONTEND}/content/uploadFile/thinkware`; // upload file (create)
export const API_THINKWARE_GET_UPLOADED_FILE = `${API_SERVICE_FRONTEND}/content/getUploadedFileName`;
export const API_THINKWARE_POST_UPDATE_FILES = `${API_SERVICE_FRONTEND}/content/uploadUpdateFile/thinkware`; // tambah path variable
export const API_THINKWARE_GET_GENERATE_PATH = `${API_SERVICE_FRONTEND}/content/generate_path`;
export const API_THINKWARE_GET_GLCODE_FROM_BRANCHCODE = `${API_SERVICE_THINKWARE}/thinkware/getGlCode`;
