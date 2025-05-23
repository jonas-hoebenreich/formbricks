import { PosthogIdentify } from "@/app/(app)/environments/[environmentId]/components/PosthogIdentify";
import { IS_POSTHOG_CONFIGURED } from "@/lib/constants";
import { canUserAccessOrganization } from "@/lib/organization/auth";
import { getOrganization } from "@/lib/organization/service";
import { getUser } from "@/lib/user/service";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { ToasterClient } from "@/modules/ui/components/toaster-client";
import { getTranslate } from "@/tolgee/server";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuthorizationError } from "@formbricks/types/errors";

const ProjectOnboardingLayout = async (props) => {
  const params = await props.params;

  const { children } = props;

  const t = await getTranslate();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect(`/auth/login`);
  }

  const user = await getUser(session.user.id);
  if (!user) {
    throw new Error(t("common.user_not_found"));
  }

  const isAuthorized = await canUserAccessOrganization(session.user.id, params.organizationId);

  if (!isAuthorized) {
    throw new AuthorizationError(t("common.not_authorized"));
  }

  const organization = await getOrganization(params.organizationId);
  if (!organization) {
    throw new Error(t("common.organization_not_found"));
  }

  return (
    <div className="flex-1 bg-slate-50">
      <PosthogIdentify
        session={session}
        user={user}
        organizationId={organization.id}
        organizationName={organization.name}
        organizationBilling={organization.billing}
        isPosthogEnabled={IS_POSTHOG_CONFIGURED}
      />
      <ToasterClient />
      {children}
    </div>
  );
};

export default ProjectOnboardingLayout;
