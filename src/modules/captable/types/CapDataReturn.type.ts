import { CaptableItemDto } from "../dto/response/captable_item.dto";

export interface CapDataRows {
    captableRows: CaptableItemDto[];
    totalRowData: CaptableItemDto;
}
