import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useUser } from "@/store/user/useUser";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";

const ProfilePictureContainer = () => {
  const userData = useUser.use.userData();
  const firstNameInit = userData?.first_name.split("");
  const lastNameInit = userData?.last_name.split("");
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();
  const { getUserData } = useUser.getState();
  const { toast } = useToast();

  const handleUploadNewImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files !== null) {
      showLoadingSm();
      const { error, data, message } = await service.cloudinaryUpload(
        e.target.files[0],
      );
      const secureUrl = data.secure_url;

      if (error) {
        toast({
          title: message,
          variant: "destructive",
        });
        hideLoadingSm();
      } else {
        const { error, message } =
          await service.patchChangeProfilePict(secureUrl);

        if (error) {
          toast({
            title: message,
            variant: "destructive",
          });
          hideLoadingSm();
        } else {
          toast({
            title: "Success change profile picture",
            variant: "success",
          });
          hideLoadingSm();
          getUserData();
        }
      }
    }
  };

  return (
    <div className="max-w-[15rem] rounded-lg border-[1px] border-border shadow-md lg:w-fit">
      <div className="flex flex-col items-center justify-center space-y-3 p-5">
        <Avatar className="min-h-[12rem] min-w-[12rem] rounded-lg">
          <AvatarImage
            className=" object-cover"
            src={userData?.profile_picture}
          />
          <AvatarFallback>
            {firstNameInit && firstNameInit[0]}
            {lastNameInit && lastNameInit[0]}
          </AvatarFallback>
        </Avatar>
        <div className="w-[12rem]">
          <ButtonWithLoading
            buttonContent="Change"
            loadingContent="Please Wait"
            className="relative w-full"
          >
            <Label
              htmlFor="change-pp"
              className="absolute inset-0 h-full w-full cursor-pointer rounded-lg"
            ></Label>
          </ButtonWithLoading>
          <Input
            onChange={(e) => handleUploadNewImage(e)}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            id="change-pp"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureContainer;
