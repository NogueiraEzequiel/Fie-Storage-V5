// FolderPage.tsx
import { FolderNavigation } from '../components/FolderNavigation';

const FolderPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <FolderNavigation initialPath="studentWorks" />
    </div>
  );
};

export default FolderPage;
