import { AccountDialogs } from "./AccountDialogs";
import { InviteDialogs } from "./InviteDialogs";
import { MembersDialog } from "./MembersDialog";
import { RoomDialogs } from "./RoomDialogs";

export function ComplementarySurfaces() {
  return <>
    <RoomDialogs />
    <InviteDialogs />
    <AccountDialogs />
    <MembersDialog />
    <div className="toast" id="toast" role="status" aria-live="polite" />
  </>;
}
