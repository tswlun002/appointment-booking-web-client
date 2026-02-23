import {colors} from "~/resources/colors/colors";
type OperationTimesProps = {
    startAt: string,
    closeAT:string,
    day: string,
    isClosed: boolean,
    isHoliday: boolean,
}
const OperationTimes = ({startAt,closeAT, day,isClosed,isHoliday}:OperationTimesProps) => {

      let statusText ;
      let  style  ;
    if(isHoliday && isClosed){
        statusText = `Closed public holiday`;
        style = { color: colors.red };
    }
    else if(isHoliday){
        style ={ color: colors.success }
        statusText = `Open public holiday ${startAt}-${closeAT}`
    }
    else if(isClosed){
        style = { color: colors.red };
        statusText = `Closed`

    }
    else{
        style= {
            color: colors.textSecondary,
            borderBottomWidth: 1,
            borderColor: colors.bgLight
        }
        statusText = `${startAt}-${closeAT}`
    }

    return (
                <ul className="text-sm space-y-2">
                    <li
                        className="flex justify-between pb-1"
                        style={{...style}}
                    >
                        <span>{`${day}:`}</span> <span>{statusText}</span>
                    </li>

                </ul>


    );
};

export default OperationTimes;