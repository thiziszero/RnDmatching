export type AnnouncementFile = {
    fileName?: string;
    fileUrl?: string;
};
  
export type Announcement = {
    subject?: string;
    viewUrl?: string;
    deptName?: string;
    managerName?: string;
    managerTel?: string;
    pressDt?: string;
    files?: {
        file?: AnnouncementFile | AnnouncementFile[];
    };
};

export type AnnouncementListData = {
    pageNo: number;
    numOfRows: number;
    totalCount: number;
    items: Announcement[];
};

export type AnnouncementResponse = {
    success: boolean;
    data: AnnouncementListData;
    message: string;
};