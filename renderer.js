alert("你好世界");
const NOTIFICATION_TITLE = "通知";
const NOTIFICATION_BODY = "好小子少壮不努力老大徒伤悲.";
const CLICK_MESSAGE = "通知 clicked!";

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
  () => (document.getElementById("output").innerText = CLICK_MESSAGE);
