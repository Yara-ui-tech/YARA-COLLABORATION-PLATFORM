import React from 'react';
import { LearningAcademyAdminCenter } from './LearningAcademyAdminCenter';

interface Props {
  adminUserId: string;
}

export const LmsAdminTab: React.FC<Props> = ({ adminUserId }) => {
  return <LearningAcademyAdminCenter adminUserId={adminUserId} />;
};
