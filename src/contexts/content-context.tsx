import React, { useEffect } from "react";
import { AxiosError } from "axios";
import ContentService from "../services/content-service";

interface IContentContext {
  isLoading: boolean;
  error: any;
  contentService: ContentService;
}

export const ContentContext = React.createContext({} as IContentContext);

type ContentContextProviderProps = {
  children: any;
};

export const ContentContextProvider = ({
  children,
}: ContentContextProviderProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<AxiosError>({} as AxiosError);

  const contentService = new ContentService();

  return (
    <ContentContext.Provider
      value={{
        contentService,
        isLoading,
        error,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
