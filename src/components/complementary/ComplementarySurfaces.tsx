import { AccountDialogs } from "./AccountDialogs";
import { InviteDialogs } from "./InviteDialogs";
import { MembersDialog } from "./MembersDialog";
import { RoomDialogs } from "./RoomDialogs";
import { PreferencesDialog } from "./PreferencesDialog";
import { ConnectionDialog } from "./ConnectionDialog";

export function ComplementarySurfaces() {
  return <>
    <RoomDialogs />
    <InviteDialogs />
    <AccountDialogs />
    <MembersDialog />
    <PreferencesDialog />
    <ConnectionDialog />
    <div className="toast" id="toast" role="status" aria-live="polite" />
  </>;
}
