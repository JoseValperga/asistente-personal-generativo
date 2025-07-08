import { Model, DataTypes, Optional, Sequelize } from "sequelize";

interface MeetingCacheAttributes {
  id: string;
  key: string;
  result: object;
  created_at?: Date;
  updated_at?: Date;
}

class MeetingCacheInstance
  extends Model<MeetingCacheAttributes>
  implements MeetingCacheAttributes
{
  public id!: string;
  public key!: string;
  public result!: object;
  public created_at?: Date;
  public updated_at?: Date;
}

const MeetingCacheModel = (sequelize: Sequelize) => {
  MeetingCacheInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      key: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      result: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },

    {
      sequelize,
      modelName: "MeetingCache",
      timestamps: true,
    }
  );
};

export default MeetingCacheModel;
