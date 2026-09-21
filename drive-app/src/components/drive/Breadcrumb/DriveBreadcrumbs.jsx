import React from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function DriveBreadcrumbs({ path = [], scope = 'drive', onParentClick }) {
  const navigate = useNavigate();

  const getRootLabel = () => {
    switch (scope) {
      case 'shared':
        return 'Shared with me';
      case 'trash':
        return 'Trash';
      default:
        return 'My Drive';
    }
  };

  const handleRootClick = (e) => {
    e.preventDefault();
    if (scope === 'shared') navigate('/shared');
    else if (scope === 'trash') navigate('/trash');
    else navigate('/drive');
  };

  const handleFolderClick = (e, folderId) => {
    e.preventDefault();
    if (scope === 'shared') {
      navigate(`/shared/folder/${folderId}`);
    } else {
      navigate(`/drive/folder/${folderId}`);
    }
  };

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      {/* Root Path Link */}
      {path.length === 0 ? (
        <Typography color="text.primary" fontWeight="500" fontSize="1.1rem">
          {getRootLabel()}
        </Typography>
      ) : (
        <Link
          underline="hover"
          color="text.secondary"
          href="#"
          onClick={handleRootClick}
          fontWeight="500"
          fontSize="1.1rem"
        >
          {getRootLabel()}
        </Link>
      )}

      {/* Path Folders */}
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;
        return isLast ? (
          onParentClick ? (
            <Link
              key={folder.id}
              underline="hover"
              color="text.primary"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onParentClick(folder);
              }}
              fontWeight="500"
              fontSize="1.1rem"
              sx={{ cursor: 'pointer' }}
            >
              {folder.name}
            </Link>
          ) : (
            <Typography key={folder.id} color="text.primary" fontWeight="500" fontSize="1.1rem">
              {folder.name}
            </Typography>
          )
        ) : (
          <Link
            key={folder.id}
            underline="hover"
            color="text.secondary"
            href="#"
            onClick={(e) => handleFolderClick(e, folder.id)}
            fontWeight="500"
            fontSize="1.1rem"
          >
            {folder.name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
