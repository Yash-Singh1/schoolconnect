// Absences screen

import { View } from "react-native";
import { useAtom } from "jotai";

import LoadingWrapper from "../src/components/LoadingWrapper";
import { tokenAtom } from "../src/store";
import { api } from "../src/utils/api";

// Dashboard when the user is an admin
const AdminAbsences: React.FC = () => {
  return <View />;
};

// Dashboard when the user is a parent
const ParentAbsences: React.FC = () => {
  return <View />;
};

const Absences: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({
    token,
  });

  return selfQuery.data ? (
    selfQuery.data.role === "admin" ? (
      <AdminAbsences />
    ) : (
      <ParentAbsences />
    )
  ) : (
    <LoadingWrapper stackName="Absences" />
  );
};

export default Absences;
